// The Arbitrum Core - Hot Potato NFT Contract
// Implements possession-based scoring and meltdown penalties.

#![cfg_attr(not(any(feature = "export-abi", test)), no_std, no_main)]
extern crate alloc;

use stylus_sdk::{
    alloy_primitives::{Address, U256},
    prelude::*,
    storage::{StorageAddress, StorageU256, StorageMap, StorageBool},
};
use alloc::{string::String, vec, vec::Vec, format};

/// Internal panic handler for no_std execution
#[cfg(target_arch = "wasm32")]
#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}
use openzeppelin_stylus::token::erc721::Erc721;

/// The Arbitrum Core - Hot Potato NFT Contract
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

    // === Scoring & Anti-Cheat ===
    pub points_balance: StorageMap<Address, StorageU256>,
    pub address_to_fid: StorageMap<Address, StorageU256>,

    // === Admin Settings ===
    pub admin: StorageAddress,
    pub last_activity_block: StorageU256,
}

// Logic Constants
const TOKEN_ID: u64 = 1;
const POINTS_PER_INTERVAL: u64 = 10;
const INTERVAL_BLOCKS: u64 = 100;     // Every 100 blocks
const SAFE_LIMIT_BLOCKS: u64 = 900;   // 30 Minutes (~1800s / 2s block)
const BURN_RATE_BPS: u64 = 500;       // 5% in Basis Points
const BURN_INTERVAL_BLOCKS: u64 = 30; // 1 Minute (~60s / 2s block)
const INACTIVITY_BLOCKS: u64 = 86400; // ~48 hours at 2s blocks

#[public]
#[inherit(Erc721)]
impl TheArbitrumCore {
    /// Initialize the game and mint the one and only Core (ID: 1)
    pub fn initialize(&mut self) -> Result<(), Vec<u8>> {
        if self.core_minted.get() {
            return Err(b"Core already minted".to_vec());
        }
        let admin = self.vm().msg_sender();
        self.admin.set(admin);
        self.erc721._mint(admin, U256::from(TOKEN_ID))?;
        self.current_holder.set(admin);
        self.last_transfer_block.set(U256::from(self.vm().block_number()));
        self.last_activity_block.set(U256::from(self.vm().block_number()));
        self.game_active.set(true);
        self.core_minted.set(true);
        Ok(())
    }

    /// Primary game action: Transfer the Core to another address
    pub fn pass_the_core(&mut self, to: Address) -> Result<(), Vec<u8>> {
        let sender = self.vm().msg_sender();
        let current = self.current_holder.get();
        
        if sender != current {
            return Err(b"Not the current holder".to_vec());
        }
        
        if to == self.previous_holder.get() {
            return Err(b"Cannot transfer to previous holder".to_vec());
        }
        
        // Anti-cheat: Check Farcaster FID
        let sender_fid = self.address_to_fid.get(sender);
        let to_fid = self.address_to_fid.get(to);
        if sender_fid > U256::ZERO && sender_fid == to_fid {
            return Err(b"Cannot transfer to same Farcaster FID".to_vec());
        }
        
        // Settle points for the sender before they lose the Core
        self._settle_points(sender)?;
        
        // Execute the transfer (ERC721)
        self.erc721._transfer(sender, to, U256::from(TOKEN_ID))?;
        
        // Update game state
        self.previous_holder.set(sender);
        self.current_holder.set(to);
        self.last_transfer_block.set(U256::from(self.vm().block_number()));
        Ok(())
    }

    /// Secondary game action: Seize the Core if it has entered meltdown
    pub fn grab_core(&mut self) -> Result<(), Vec<u8>> {
        let sender = self.vm().msg_sender();
        let holder = self.current_holder.get();
        let _prev = self.previous_holder.get();
        let melting = self.is_melting()?;
        
        if !melting {
            return Err(b"Core is stable".to_vec());
        }
        
        if sender == holder {
            return Err(b"You already hold the Core".to_vec());
        }

        // Settle points for the penalized holder
        self._settle_points(holder)?;
        
        // Execute the transfer (ERC721)
        self.erc721._transfer(holder, sender, U256::from(TOKEN_ID))?;
        
        // Update game state
        self.previous_holder.set(holder);
        self.current_holder.set(sender);
        self.last_transfer_block.set(U256::from(self.vm().block_number()));
        self.last_activity_block.set(U256::from(self.vm().block_number()));
        
        Ok(())
    }

    /// Internal: Calculate and update points balance (earnings or penalties)
    fn _settle_points(&mut self, holder: Address) -> Result<(), Vec<u8>> {
        let blocks_held = U256::from(self.vm().block_number()) - self.last_transfer_block.get();
        let mut balance = self.points_balance.get(holder);
        
        if blocks_held <= U256::from(SAFE_LIMIT_BLOCKS) {
            // Safe zone: Add earned points
            let intervals = blocks_held / U256::from(INTERVAL_BLOCKS);
            let earned = intervals * U256::from(POINTS_PER_INTERVAL);
            balance = balance + earned;
        } else {
            // Meltdown zone: Calculate burn penalty
            let meltdown_blocks = blocks_held - U256::from(SAFE_LIMIT_BLOCKS);
            let penalty_periods = meltdown_blocks / U256::from(BURN_INTERVAL_BLOCKS);
            
            // 5% penalty per period (minized to total balance)
            let penalty = balance * penalty_periods * U256::from(BURN_RATE_BPS) / U256::from(10000);
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
        let blocks_held = U256::from(self.vm().block_number()) - self.last_transfer_block.get();
        Ok(blocks_held > U256::from(SAFE_LIMIT_BLOCKS))
    }

    pub fn game_state(&self) -> Result<(Address, Address, U256, bool), Vec<u8>> {
        Ok((
            self.current_holder.get(),
            self.previous_holder.get(),
            self.last_transfer_block.get(),
            self.is_melting()?,
        ))
    }

    // === Admin Functions ===

    pub fn admin_reset(&mut self) -> Result<(), Vec<u8>> {
        let sender = self.vm().msg_sender();
        if sender != self.admin.get() {
            return Err(b"Not admin".to_vec());
        }
        
        let inactivity = U256::from(self.vm().block_number()) - self.last_activity_block.get();
        if inactivity < U256::from(INACTIVITY_BLOCKS) {
            return Err(b"Not inactive long enough".to_vec());
        }
        
        let current = self.current_holder.get();
        self.erc721._transfer(current, sender, U256::from(TOKEN_ID))?;
        self.current_holder.set(sender);
        self.previous_holder.set(Address::ZERO);
        self.last_transfer_block.set(U256::from(self.vm().block_number()));
        
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
        let holder = self.current_holder.get();
        let melting = self.is_melting()?;
        let state = if melting { "MELTDOWN" } else { "STABLE" };
        
        let metadata = format!(
            r#"{{"name":"The Core [Held by {}]","description":"Hot Potato NFT on Arbitrum. Pass it before it melts!","attributes":[{{"trait_type":"Status","value":"{}"}}]}}"#,
            holder,
            state
        );
        Ok(metadata)
    }
}