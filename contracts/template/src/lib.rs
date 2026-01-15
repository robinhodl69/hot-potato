// The Arbitrum Core v2 - Phoenix Model
// Hot Potato NFT with generational respawn mechanics.
// When a Core "dies" (holder inactive), a new one rises from its ashes.

#![cfg_attr(not(any(feature = "export-abi", test)), no_std, no_main)]
extern crate alloc;

use stylus_sdk::{
    alloy_primitives::{Address, U256},
    prelude::*,
    storage::{StorageAddress, StorageU256, StorageMap, StorageBool},
};
use alloc::{string::String, vec, vec::Vec};

/// Internal panic handler for no_std execution
#[cfg(target_arch = "wasm32")]
#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}
use openzeppelin_stylus::token::erc721::Erc721;

/// The Arbitrum Core v2 - Phoenix Model Contract
#[entrypoint]
#[storage]
pub struct TheArbitrumCore {
    // === ERC721 Base ===
    #[borrow]
    pub erc721: Erc721,

    // === Game State ===
    pub current_holder: StorageAddress,
    pub previous_holder: StorageAddress,
    pub last_transfer_block: StorageU256,
    pub game_active: StorageBool,
    pub core_minted: StorageBool,

    // === Phoenix Model (v2) ===
    pub active_core_id: StorageU256,        // Currently active Core token ID
    pub total_cores_minted: StorageU256,    // Generation counter
    pub dead_core_holders: StorageMap<U256, StorageAddress>,  // CoreID → Last holder (shame)

    // === Scoring & Anti-Cheat ===
    pub points_balance: StorageMap<Address, StorageU256>,
    pub address_to_fid: StorageMap<Address, StorageU256>,

    // === Admin Settings ===
    pub admin: StorageAddress,
    pub last_activity_block: StorageU256,
}

// Logic Constants (L1 blocks, ~12s each)
// Frontend will handle visual timer conversion
const POINTS_PER_INTERVAL: u64 = 10;
const INTERVAL_BLOCKS: u64 = 17;        // ~200s (17 blocks × 12s)
const SAFE_LIMIT_BLOCKS: u64 = 150;     // ~30 Minutes (150 blocks × 12s)
const BURN_RATE_BPS: u64 = 500;         // 5% in Basis Points
const BURN_INTERVAL_BLOCKS: u64 = 5;    // ~1 Minute (5 blocks × 12s)
const INACTIVITY_BLOCKS: u64 = 300;     // ~1 hour (300 blocks × 12s)
const PHOENIX_COOLDOWN: u64 = 150;      // 30 min after meltdown to spawn

#[public]
#[inherit(Erc721)]
impl TheArbitrumCore {
    /// Internal: Get the block number (L1)
    fn _get_block_number(&self) -> U256 {
        U256::from(self.vm().block_number())
    }

    /// Initialize the game and mint the first Core (ID: 1)
    pub fn initialize(&mut self) -> Result<(), Vec<u8>> {
        if self.core_minted.get() {
            return Err(b"MINTED".to_vec());
        }
        let admin = self.vm().msg_sender();
        let first_core_id = U256::from(1);
        let now = self._get_block_number();
        
        self.admin.set(admin);
        self.erc721._mint(admin, first_core_id)?;
        self.current_holder.set(admin);
        self.active_core_id.set(first_core_id);
        self.total_cores_minted.set(first_core_id);
        self.last_transfer_block.set(now);
        self.last_activity_block.set(now);
        self.game_active.set(true);
        self.core_minted.set(true);
        Ok(())
    }

    /// Primary game action: Transfer the Core to another address
    pub fn pass_the_core(&mut self, to: Address) -> Result<(), Vec<u8>> {
        if to == Address::ZERO {
            return Err(b"ZERO".to_vec());
        }
        let sender = self.vm().msg_sender();
        let current = self.current_holder.get();
        let active_id = self.active_core_id.get();
        
        if sender != current {
            return Err(b"OWNER".to_vec());
        }
        
        if to == self.previous_holder.get() {
            return Err(b"PREV".to_vec());
        }
        
        // Anti-cheat: Check Farcaster FID
        let sender_fid = self.address_to_fid.get(sender);
        let to_fid = self.address_to_fid.get(to);
        if sender_fid == to_fid && sender_fid > U256::ZERO {
            return Err(b"FID".to_vec());
        }
        
        // Settle points for the sender before they lose the Core
        self._settle_points(sender)?;
        
        // Execute the transfer (ERC721) using the active core ID
        self.erc721._transfer(sender, to, active_id)?;
        
        // Update game state
        self.previous_holder.set(sender);
        self.current_holder.set(to);
        
        let now = self._get_block_number();
        self.last_transfer_block.set(now);
        self.last_activity_block.set(now);
        Ok(())
    }

    /// Secondary game action: Seize the Core if it has entered meltdown
    pub fn grab_core(&mut self) -> Result<(), Vec<u8>> {
        let sender = self.vm().msg_sender();
        let holder = self.current_holder.get();
        let active_id = self.active_core_id.get();
        let melting = self.is_melting()?;
        
        if !melting {
            return Err(b"STABLE".to_vec());
        }
        
        if sender == holder {
            return Err(b"HOLDING".to_vec());
        }

        // Settle points for the penalized holder
        self._settle_points(holder)?;
        
        // Execute the transfer (ERC721)
        self.erc721._transfer(holder, sender, active_id)?;
        
        // Update game state
        let now = self._get_block_number();
        self.previous_holder.set(holder);
        self.current_holder.set(sender);
        self.last_transfer_block.set(now);
        self.last_activity_block.set(now);
        
        Ok(())
    }

    /// Phoenix Model: Spawn a new Core when the current one is dead
    /// The old Core stays with the inactive holder as a "dead trophy"
    pub fn spawn_new_core(&mut self) -> Result<(), Vec<u8>> {
        let sender = self.vm().msg_sender();
        let now = self._get_block_number();
        let last_transfer = self.last_transfer_block.get();
        let blocks_since_transfer = now.saturating_sub(last_transfer);
        
        // Must be in meltdown AND past the phoenix cooldown
        let meltdown_threshold = U256::from(SAFE_LIMIT_BLOCKS);
        let phoenix_threshold = U256::from(SAFE_LIMIT_BLOCKS + PHOENIX_COOLDOWN);
        
        if blocks_since_transfer <= meltdown_threshold {
            return Err(b"STABLE".to_vec());
        }
        
        if blocks_since_transfer <= phoenix_threshold {
            return Err(b"CD".to_vec());
        }
        
        // Record the dead Core and its last holder
        let old_core_id = self.active_core_id.get();
        let old_holder = self.current_holder.get();
        self.dead_core_holders.setter(old_core_id).set(old_holder);
        
        // Mint the new Core
        let new_core_id = self.total_cores_minted.get() + U256::from(1);
        self.erc721._mint(sender, new_core_id)?;
        
        // Update game state for the new Core
        self.active_core_id.set(new_core_id);
        self.total_cores_minted.set(new_core_id);
        self.current_holder.set(sender);
        self.previous_holder.set(Address::ZERO);  // Reset cooldown
        self.last_transfer_block.set(now);
        self.last_activity_block.set(now);
        
        Ok(())
    }

    /// Internal: Calculate and update points balance (earnings or penalties)
    fn _settle_points(&mut self, holder: Address) -> Result<(), Vec<u8>> {
        let now = self._get_block_number();
        let last_transfer = self.last_transfer_block.get();
        let blocks_held = now.saturating_sub(last_transfer);
        let mut balance = self.points_balance.get(holder);
        
        if blocks_held <= U256::from(SAFE_LIMIT_BLOCKS) {
            // Safe zone: Add earned points
            let intervals = blocks_held / U256::from(INTERVAL_BLOCKS);
            let earned = intervals * U256::from(POINTS_PER_INTERVAL);
            balance = balance + earned;
        } else {
            // Meltdown zone: Calculate burn penalty
            let meltdown_blocks = blocks_held.saturating_sub(U256::from(SAFE_LIMIT_BLOCKS));
            let penalty_periods = meltdown_blocks / U256::from(BURN_INTERVAL_BLOCKS);
            
            // 5% penalty per period (minimized to total balance)
            let penalty = (balance * penalty_periods * U256::from(BURN_RATE_BPS)) / U256::from(10000);
            balance = if penalty >= balance { U256::ZERO } else { balance - penalty };
        }
        
        self.points_balance.setter(holder).set(balance);
        Ok(())
    }

    // === View Functions ===

    pub fn get_points(&self, addr: Address) -> Result<U256, Vec<u8>> {
        Ok(self.points_balance.get(addr))
    }

    pub fn is_melting(&self) -> Result<bool, Vec<u8>> {
        let now = self._get_block_number();
        let last = self.last_transfer_block.get();
        let blocks_held = now.saturating_sub(last);
        Ok(blocks_held > U256::from(SAFE_LIMIT_BLOCKS))
    }

    /// Check if the Core is ready for Phoenix respawn
    pub fn can_spawn_new_core(&self) -> Result<bool, Vec<u8>> {
        let now = self._get_block_number();
        let last = self.last_transfer_block.get();
        let blocks_held = now.saturating_sub(last);
        Ok(blocks_held > U256::from(SAFE_LIMIT_BLOCKS + PHOENIX_COOLDOWN))
    }

    /// Get the currently active Core ID
    pub fn active_core(&self) -> Result<U256, Vec<u8>> {
        Ok(self.active_core_id.get())
    }

    /// Get the last holder of a dead Core (Hall of Shame)
    pub fn dead_core_holder(&self, core_id: U256) -> Result<Address, Vec<u8>> {
        Ok(self.dead_core_holders.get(core_id))
    }

    pub fn game_state(&self) -> Result<(Address, Address, U256, bool, U256), Vec<u8>> {
        Ok((
            self.current_holder.get(),
            self.previous_holder.get(),
            self.last_transfer_block.get(),
            self.is_melting()?,
            self.active_core_id.get(),
        ))
    }

    // === Security Overrides ===

    /// Block standard transfer_from to force use of pass_the_core()
    pub fn transfer_from(&mut self, _from: Address, _to: Address, _token_id: U256) -> Result<(), Vec<u8>> {
        Err(b"RULES".to_vec())
    }

    /// Block standard safe_transfer_from (variante 1)
    pub fn safe_transfer_from(&mut self, _from: Address, _to: Address, _token_id: U256) -> Result<(), Vec<u8>> {
        Err(b"RULES".to_vec())
    }

    /// Block standard safe_transfer_from (variante 2 con data)
    #[selector(name = "safeTransferFrom")]
    pub fn safe_transfer_from_with_data(&mut self, _from: Address, _to: Address, _token_id: U256, _data: Vec<u8>) -> Result<(), Vec<u8>> {
        Err(b"RULES".to_vec())
    }

    // === Admin Functions ===

    pub fn admin_reset(&mut self) -> Result<(), Vec<u8>> {
        let sender = self.vm().msg_sender();
        if sender != self.admin.get() {
            return Err(b"ADMIN".to_vec());
        }
        
        let now = self._get_block_number();
        let inactivity = now.saturating_sub(self.last_activity_block.get());
        if inactivity < U256::from(INACTIVITY_BLOCKS) {
            return Err(b"TIME".to_vec());
        }
        
        // Use Phoenix spawn instead of forced transfer
        let old_core_id = self.active_core_id.get();
        let old_holder = self.current_holder.get();
        self.dead_core_holders.setter(old_core_id).set(old_holder);
        
        let new_core_id = self.total_cores_minted.get() + U256::from(1);
        self.erc721._mint(sender, new_core_id)?;
        
        self.active_core_id.set(new_core_id);
        self.total_cores_minted.set(new_core_id);
        self.current_holder.set(sender);
        self.previous_holder.set(Address::ZERO);
        self.last_transfer_block.set(now);
        self.last_activity_block.set(now);
        
        Ok(())
    }

    pub fn register_fid(&mut self, addr: Address, fid: U256) -> Result<(), Vec<u8>> {
        if self.vm().msg_sender() != self.admin.get() {
            return Err(b"Not admin".to_vec());
        }
        self.address_to_fid.setter(addr).set(fid);
        Ok(())
    }

    // === Metadata ===

    pub fn name(&self) -> Result<String, Vec<u8>> {
        Ok(String::from("The Arbitrum Core"))
    }

    pub fn symbol(&self) -> Result<String, Vec<u8>> {
        Ok(String::from("CORE"))
    }

    #[selector(name = "tokenURI")]
    pub fn token_uri(&self, _token_id: U256) -> Result<String, Vec<u8>> {
        let status = if self.is_melting()? { "MELT" } else { "OK" };
        let mut out = Vec::new();
        out.extend_from_slice(b"{\"name\":\"Core\",\"attributes\":[{\"trait_type\":\"Status\",\"value\":\"");
        out.extend_from_slice(status.as_bytes());
        out.extend_from_slice(b"\"}]}");
        Ok(String::from_utf8(out).unwrap_or_default())
    }
}