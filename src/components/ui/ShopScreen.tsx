import React, { useState } from 'react';
import { ArrowLeft, Coins, ShieldCheck, Heart, Magnet, Zap, ShoppingCart } from 'lucide-react';
import useGameStore from '../../store/gameStore';
import { ShopItem as ShopItemType } from '../../types/game';

// Item icon mapping
const getItemIcon = (type: string, id: string) => {
  switch(id) {
    case 'extralife':
      return <Heart className="w-5 h-5 text-red-500" />;
    case 'shield':
      return <ShieldCheck className="w-5 h-5 text-blue-500" />;
    case 'magnet':
      return <Magnet className="w-5 h-5 text-purple-500" />;
    case 'doublejump':
      return <Zap className="w-5 h-5 text-yellow-500" />;
    default:
      return <ShoppingCart className="w-5 h-5 text-white" />;
  }
};

// Shop item component
const ShopItem: React.FC<{
  item: ShopItemType;
  onPurchase: (itemId: string) => void;
  disabled: boolean;
}> = ({ item, onPurchase, disabled }) => {
  return (
    <div className={`bg-gray-800 border-2 ${item.owned ? 'border-green-500' : 'border-gray-700'} rounded-lg p-4 w-full max-w-xs`}>
      <div className="flex items-center mb-2">
        <div className="mr-2">{getItemIcon(item.type, item.id)}</div>
        <div className="text-white font-bold">{item.name}</div>
        <div className="ml-auto text-sm bg-gray-700 px-2 py-1 rounded">
          {item.type}
        </div>
      </div>
      
      <p className="text-gray-300 text-sm mb-3">{item.description}</p>
      {item.effect && <p className="text-blue-300 text-xs mb-3">{item.effect}</p>}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Coins size={14} className="text-yellow-400 mr-1" />
          <span className="text-yellow-400 font-bold">{item.price}</span>
        </div>
        
        {item.owned ? (
          <span className="text-green-500 text-sm font-bold">Owned</span>
        ) : (
          <button
            onClick={() => onPurchase(item.id)}
            disabled={disabled}
            className={`px-3 py-1 rounded-md text-sm font-semibold ${
              disabled
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-500 text-gray-900 hover:bg-yellow-600 transition'
            }`}
          >
            Buy
          </button>
        )}
      </div>
    </div>
  );
};

const ShopScreen: React.FC = () => {
  const { totalCoins, shopItems, purchaseItem, returnToMenu } = useGameStore();
  const [purchaseStatus, setPurchaseStatus] = useState<{message: string, success: boolean} | null>(null);
  
  const handlePurchase = (itemId: string) => {
    const item = shopItems.find(item => item.id === itemId);
    
    if (!item) {
      setPurchaseStatus({
        message: 'Item not found',
        success: false
      });
      return;
    }
    
    if (item.owned) {
      setPurchaseStatus({
        message: 'You already own this item',
        success: false
      });
      return;
    }
    
    if (totalCoins < item.price) {
      setPurchaseStatus({
        message: 'Not enough coins',
        success: false
      });
      return;
    }
    
    const success = purchaseItem(itemId);
    
    setPurchaseStatus({
      message: success ? `Successfully purchased ${item.name}!` : 'Failed to purchase item',
      success: success
    });
    
    // Clear status after 3 seconds
    setTimeout(() => {
      setPurchaseStatus(null);
    }, 3000);
  };
  
  // Group items by type
  const powerups = shopItems.filter(item => item.type === 'powerup');
  const abilities = shopItems.filter(item => item.type === 'ability');
  const skins = shopItems.filter(item => item.type === 'skin');
  
  return (
    <div className="absolute inset-0 flex flex-col bg-black bg-opacity-75">
      <div className="p-4 bg-gray-900 flex items-center">
        <button 
          onClick={returnToMenu}
          className="mr-4 p-2 hover:bg-gray-800 rounded transition"
        >
          <ArrowLeft className="text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Shop</h1>
        <div className="ml-auto flex items-center bg-gray-800 rounded-full px-4 py-1">
          <Coins className="h-4 w-4 text-yellow-400 mr-2" />
          <span className="text-yellow-400 font-bold">{totalCoins}</span>
        </div>
      </div>
      
      {/* Purchase status message */}
      {purchaseStatus && (
        <div className={`mx-auto mt-2 px-4 py-2 rounded-md ${
          purchaseStatus.success ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {purchaseStatus.message}
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {/* Powerups */}
          <div className="mb-6">
            <h2 className="text-white font-bold text-lg mb-2">Powerups</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {powerups.map(item => (
                <ShopItem 
                  key={item.id} 
                  item={item} 
                  onPurchase={handlePurchase}
                  disabled={totalCoins < item.price || item.owned}
                />
              ))}
            </div>
          </div>
          
          {/* Abilities */}
          <div className="mb-6">
            <h2 className="text-white font-bold text-lg mb-2">Abilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {abilities.map(item => (
                <ShopItem 
                  key={item.id} 
                  item={item} 
                  onPurchase={handlePurchase}
                  disabled={totalCoins < item.price || item.owned}
                />
              ))}
            </div>
          </div>
          
          {/* Skins */}
          <div className="mb-6">
            <h2 className="text-white font-bold text-lg mb-2">Character Skins</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skins.map(item => (
                <ShopItem 
                  key={item.id} 
                  item={item} 
                  onPurchase={handlePurchase}
                  disabled={totalCoins < item.price || item.owned}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopScreen; 