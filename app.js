import React, { useState, useEffect } from 'react';

// Initialize Firebase (though no actual Firebase logic will be implemented in this frontend-only example)
// This is just to satisfy the requirement if a Firebase integration were to be pursued later.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

// Placeholder for Firebase App and Firestore instances
let app;
let db;
let auth;

// Initial dummy data for demonstration
const initialDummyHotPairs = [
  { name: 'BNB', price: '620.19', change: '-1.50%', value: '$620.19' },
  { name: 'BTC', price: '101,284.49', change: '-0.94%', value: '$101,284.49' },
  { name: 'ETH', price: '2,241.43', change: '-0.82%', value: '$2,241.43' },
  { name: 'SOL', price: '132.94', change: '-1.18%', value: '$132.94' },
  { name: 'FUN', price: '0.009603', change: '+22.50%', value: '$0.009603' },
  { name: 'XRP', price: '2.0229', change: '-1.81%', value: '$0.02' },
];

const initialDummyMarketPairs = [
  { name: 'ETHUSDT', vol: '21.30B', price: '2,240.16', change: '-0.90%' },
  { name: 'TURBO/USDT', vol: '5.40M', price: '0.003157', change: '-1.74%' },
  { name: 'TONUSDT', vol: '73.11M', price: '2.7395', change: '-3.22%' },
  { name: 'DOGEUSDT', vol: '1.37B', price: '0.15274', change: '-1.03%' },
  { name: 'BNBUSDT', vol: '466.31M', price: '620.18', change: '-1.46%' },
  { name: 'PLUMEUSDT', vol: '4.55M', price: '0.0793', change: '+0.63%' },
  { name: 'TRUMPUSDT', vol: '8.65B', price: '8.658', change: '-2.47%' },
  { name: 'CVX/USDT', vol: '909,805.39', price: '2.381', change: '+0.34%' },
];

const dummyOrderBook = [
  { price: '0.2002', amount: '17.24K', type: 'sell' },
  { price: '0.2001', amount: '350.95K', type: 'sell' },
  { price: '0.2000', amount: '123.96K', type: 'sell' },
  { price: '0.1999', amount: '398.28173', type: 'sell' },
  { price: '0.1998', amount: '49.88K', type: 'sell' },
  { price: '0.1997', amount: '6.41K', type: 'sell' },
  { price: '0.1996', amount: '', type: 'mid', currentPrice: '0.1996' }, // Current price separator
  { price: '0.1995', amount: '6.32K', type: 'buy' },
  { price: '0.1994', amount: '25.28K', type: 'buy' },
  { price: '0.1993', amount: '23.16K', type: 'buy' },
  { price: '0.1992', amount: '38.87K', type: 'buy' },
  { price: '0.1991', amount: '29.02K', type: 'buy' },
  { price: '0.1990', amount: '17.58K', type: 'buy' },
];

const dummyWalletAssets = [
  { currency: 'USDT', total: 1.45, available: 1.45, inOrder: 0.00 },
  { currency: 'BTC', total: 0.000012, available: 0.000012, inOrder: 0.00 },
  { currency: 'ETH', total: 0.00005, available: 0.00005, inOrder: 0.00 },
  { currency: 'BNB', total: 0.0001, available: 0.0001, inOrder: 0.00 },
  { currency: 'SOL', total: 0.00001, available: 0.00001, inOrder: 0.00 },
];

// Helper to get icon based on name
const getIcon = (name) => {
  switch (name) {
    case 'BNB': return '💰';
    case 'BTC': return '₿';
    case 'ETH': return 'Ξ';
    case 'SOL': return '🔆';
    case 'FUN': return '🎉';
    case 'XRP': return ' Ripple';
    case 'USDT': return '💲';
    default: return '';
  }
};

// Custom message box function
const showFeatureComingSoon = (featureName) => {
  const messageBox = document.createElement('div');
  messageBox.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    text-align: center;
    font-family: 'Inter', sans-serif;
  `;
  messageBox.innerHTML = `
    <p class="text-lg font-semibold mb-4">${featureName}</p>
    <p class="text-gray-700 mb-6">This feature is coming soon or requires backend implementation.</p>
    <button onclick="this.parentNode.remove()" class="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-md">OK</button>
  `;
  document.body.appendChild(messageBox);
};


const Header = ({ title, showBack = false, showSearch = true, showHeadphones = true, showSettings = true, onBackClick, onSearchClick, onHeadphonesClick, onSettingsClick }) => (
  <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100 shadow-sm">
    {showBack ? (
      <button className="text-gray-600 hover:text-gray-900 transition-colors duration-200" onClick={onBackClick}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
    ) : (
      <span className="text-xl font-bold text-gray-800">{title}</span>
    )}
    <div className="flex items-center space-x-4">
      {showSearch && (
        <button className="text-gray-600 hover:text-gray-900 transition-colors duration-200" onClick={onSearchClick}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      )}
      {showHeadphones && (
        <button className="text-gray-600 hover:text-gray-900 transition-colors duration-200" onClick={onHeadphonesClick}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13m-6 5l-3-3m0 0l-3 3m3-3v3m-8-12h7.5M8 12h7.5M8 16h7.5" />
          </svg>
        </button>
      )}
      {showSettings && (
        <button className="text-gray-600 hover:text-gray-900 transition-colors duration-200" onClick={onSettingsClick}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.525.32 1.05.65 1.574 1.066z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}
    </div>
  </div>
);

const IconButton = ({ icon, label, onClick }) => (
  <button
    className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
    onClick={onClick}
  >
    <div className="bg-gray-100 rounded-full p-2 mb-1">
      {icon}
    </div>
    <span className="text-xs text-gray-700 font-medium">{label}</span>
  </button>
);

const HotPairCard = ({ pair }) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100 mb-2 hover:shadow-md transition-shadow duration-200 cursor-pointer">
    <div className="flex items-center space-x-3">
      <span className="text-xl">{getIcon(pair.name)}</span>
      <div>
        <p className="text-base font-semibold text-gray-800">{pair.name}</p>
        <p className="text-sm text-gray-500">{pair.value}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-base font-semibold text-gray-800">{pair.price}</p>
      <p className={`text-sm font-medium ${pair.change.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>{pair.change}</p>
    </div>
  </div>
);

const MarketPairRow = ({ pair }) => (
  <div className="flex items-center justify-between py-3 px-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
    <div className="flex flex-col flex-1">
      <p className="text-sm font-medium text-gray-800">{pair.name} <span className="text-xs text-gray-500">/{pair.vol}</span></p>
    </div>
    <div className="flex flex-col items-end flex-1">
      <p className="text-sm font-medium text-gray-800">{pair.price}</p>
    </div>
    <div className="flex-none w-20 text-right">
      <p className={`px-2 py-1 rounded-md text-white text-xs font-medium inline-block ${pair.change.startsWith('-') ? 'bg-red-500' : 'bg-green-500'}`}>
        {pair.change}
      </p>
    </div>
  </div>
);

const NavBar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { name: 'Home', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ), tab: 'home' },
    { name: 'Markets', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13m-6 5l-3-3m0 0l-3 3m3-3v3m-8-12h7.5M8 12h7.5M8 16h7.5" />
      </svg>
    ), tab: 'markets' },
    { name: 'Trade', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ), tab: 'trade' },
    { name: 'Futures', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ), tab: 'futures' },
    { name: 'Assets', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4c1.729 0 3.109 1.047 3.659 2.5H18a2 2 0 012 2v1a2 2 0 01-2 2h-1.447c.307.97.07 2.15-.75 2.97-1.332 1.333-3.111 2.372-5.04 2.685V18a2 2 0 11-4 0v-1.153c-1.929-.313-3.708-1.352-5.04-2.685-.82-.82-.997-2-.75-2.97H4a2 2 0 012-2h1.447c.55-1.453 1.93-2.5 3.659-2.5z" />
      </svg>
    ), tab: 'wallet' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-2 shadow-lg z-50">
      {navItems.map((item) => (
        <button
          key={item.name}
          className={`flex flex-col items-center text-xs font-medium p-2 rounded-md transition-colors duration-200 ${
            activeTab === item.tab ? 'text-yellow-500' : 'text-gray-500 hover:text-gray-700'
          } focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75`}
          onClick={() => setActiveTab(item.tab)}
        >
          {React.cloneElement(item.icon, {
            className: `h-6 w-6 ${activeTab === item.tab ? 'text-yellow-500' : ''}`
          })}
          {item.name}
        </button>
      ))}
    </div>
  );
};

const HomePage = ({ onAddFundsClick, onProfileClick, hotPairs }) => (
  <div className="flex flex-col min-h-screen bg-gray-50">
    {/* Header */}
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center space-x-2">
        <img
          src="https://placehold.co/40x40/FFD700/000?text=B" // Binance-like logo placeholder
          alt="Logo"
          className="w-8 h-8 rounded-full"
        />
        <input
          type="text"
          placeholder="#MarketPullback"
          className="bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 w-40 placeholder-gray-500"
          onClick={() => showFeatureComingSoon("Search Bar")}
        />
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-gray-600 hover:text-gray-900 transition-colors duration-200" onClick={() => showFeatureComingSoon("Notifications")}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <button className="text-gray-600 hover:text-gray-900 transition-colors duration-200" onClick={() => showFeatureComingSoon("Headphones / Support")}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13m-6 5l-3-3m0 0l-3 3m3-3v3m-8-12h7.5M8 12h7.5M8 16h7.5" />
          </svg>
        </button>
        <button className="text-gray-600 hover:text-gray-900 transition-colors duration-200" onClick={onProfileClick}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>
    </div>

    {/* Balance & Add Funds */}
    <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-3xl font-bold text-gray-800">1.45</p>
        <p className="text-sm text-gray-500">≈ $1.46</p>
      </div>
      <button
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
        onClick={onAddFundsClick}
      >
        Add Funds
      </button>
    </div>

    {/* Shortcut Icons */}
    <div className="grid grid-cols-4 gap-4 p-4 bg-white border-b border-gray-100">
      <IconButton icon={<span className="text-yellow-500 text-xl">🏆</span>} label="Rewards Hub" onClick={() => showFeatureComingSoon("Rewards Hub")} />
      <IconButton icon={<span className="text-yellow-500 text-xl">🤝</span>} label="Referral" onClick={() => showFeatureComingSoon("Referral")} />
      <IconButton icon={<span className="text-yellow-500 text-xl">👑</span>} label="Traders League" onClick={() => showFeatureComingSoon("Traders League")} />
      <IconButton icon={<span className="text-yellow-500 text-xl">💰</span>} label="Earn" onClick={() => showFeatureComingSoon("Earn")} />
      <IconButton icon={<span className="text-gray-500 text-xl">···</span>} label="More" onClick={() => showFeatureComingSoon("More Services")} />
    </div>

    {/* Market Categories */}
    <div className="flex px-4 py-3 bg-white border-b border-gray-100 text-sm font-semibold text-gray-700 overflow-x-auto whitespace-nowrap">
      <span className="pb-2 border-b-2 border-yellow-500 text-yellow-500 mr-6 cursor-pointer" onClick={() => showFeatureComingSoon("Hot Category")}>Hot</span>
      <span className="pb-2 mr-6 hover:text-yellow-500 cursor-pointer" onClick={() => showFeatureComingSoon("New Category")}>New</span>
      <span className="pb-2 mr-6 hover:text-yellow-500 cursor-pointer" onClick={() => showFeatureComingSoon("Gainers Category")}>Gainers</span>
      <span className="pb-2 mr-6 hover:text-yellow-500 cursor-pointer" onClick={() => showFeatureComingSoon("Losers Category")}>Losers</span>
      <span className="pb-2 mr-6 hover:text-yellow-500 cursor-pointer" onClick={() => showFeatureComingSoon("24h Vol Category")}>24h Vol</span>
      <span className="pb-2 mr-6 hover:text-yellow-500 cursor-pointer" onClick={() => showFeatureComingSoon("Favorites Category")}>Favorites</span>
    </div>

    {/* Hot Trading Pairs List */}
    <div className="flex-1 overflow-y-auto p-4">
      {hotPairs.map((pair, index) => (
        <HotPairCard key={index} pair={pair} />
      ))}
      <button className="w-full text-center text-sm font-semibold text-yellow-500 py-3 mt-2 rounded-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75" onClick={() => showFeatureComingSoon("View More Hot Pairs")}>
        View More
      </button>
    </div>
  </div>
);

const MarketsPage = ({ marketPairs }) => {
  const [selectedTab, setSelectedTab] = useState('Hot');

  const categories = ['Favorites', 'Hot', 'Alpha', 'New', 'Gainers', 'Spot', 'Futures'];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header
        title=""
        showBack={false}
        showSettings={false}
        onSearchClick={() => showFeatureComingSoon("Search Markets")}
        onHeadphonesClick={() => showFeatureComingSoon("Markets Support")}
        onSettingsClick={() => showFeatureComingSoon("Markets Settings")}
      /> {/* Custom header for Markets */}
      <div className="flex items-center p-4 bg-white border-b border-gray-100">
        <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-2 flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search Coin Pairs"
            className="bg-transparent text-sm focus:outline-none w-full placeholder-gray-500"
            onClick={() => showFeatureComingSoon("Search Coin Pairs")}
          />
        </div>
      </div>

      {/* Market Categories */}
      <div className="flex px-4 py-3 bg-white border-b border-gray-100 text-sm font-semibold text-gray-700 overflow-x-auto whitespace-nowrap">
        {categories.map((category) => (
          <button
            key={category}
            className={`pb-2 mr-6 ${selectedTab === category ? 'border-b-2 border-yellow-500 text-yellow-500' : 'hover:text-yellow-500'} focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75`}
            onClick={() => setSelectedTab(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Market Pairs List Header */}
      <div className="flex items-center justify-between py-2 px-4 bg-gray-100 text-xs text-gray-500 font-medium border-b border-gray-200">
        <p className="flex-1 cursor-pointer hover:text-gray-700" onClick={() => showFeatureComingSoon("Sort by Name/Vol")}>Name / Vol</p>
        <p className="flex-1 text-right cursor-pointer hover:text-gray-700" onClick={() => showFeatureComingSoon("Sort by Last Price")}>Last Price</p>
        <p className="w-20 text-right cursor-pointer hover:text-gray-700" onClick={() => showFeatureComingSoon("Sort by 24h Chg%")}>24h Chg%</p>
      </div>

      {/* Market Pairs List */}
      <div className="flex-1 overflow-y-auto">
        {marketPairs.map((pair, index) => (
          <MarketPairRow key={index} pair={pair} />
        ))}
      </div>
    </div>
  );
};

const TradePage = () => {
  const [activeTradeTab, setActiveTradeTab] = useState('Limit'); // Limit, Market, Stop-Limit
  const [buySellTab, setBuySellTab] = useState('Buy'); // Buy, Sell
  const [tradePrice, setTradePrice] = useState(0.1997);
  const [tradeAmount, setTradeAmount] = useState(0);

  const handlePriceChange = (increment) => {
    setTradePrice(prevPrice => parseFloat((prevPrice + increment).toFixed(5)));
  };

  const handleAmountChange = (increment) => {
    setTradeAmount(prevAmount => prevAmount + increment);
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header
        title=""
        showBack={false}
        showSettings={true}
        onSearchClick={() => showFeatureComingSoon("Trade Search")}
        onHeadphonesClick={() => showFeatureComingSoon("Trade Support")}
        onSettingsClick={() => showFeatureComingSoon("Trade Settings")}
      /> {/* Custom header for Trade */}
      {/* Trade Pair Selector and Options */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100">
        <div className="flex items-center">
          <select className="font-bold text-xl text-gray-800 bg-transparent focus:outline-none cursor-pointer" onChange={(e) => showFeatureComingSoon(`Selected Pair: ${e.target.value}`)}>
            <option>OM/USDT</option>
            <option>BTC/USDT</option>
          </select>
          <span className="text-red-500 text-xs ml-2">-5.22%</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75" onClick={() => showFeatureComingSoon("Isolated Mode")}>Isolated</button>
          <button className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75" onClick={() => showFeatureComingSoon("Leverage 3.00x")}>3.00x</button>
          <button className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75" onClick={() => showFeatureComingSoon("Auto Mode")}>Auto</button>
          <button className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75" onClick={() => showFeatureComingSoon("B/R Mode")}>B/R</button>
        </div>
      </div>

      {/* Trade Type Tabs (Convert, Spot, Margin, Buy/Sell) */}
      <div className="flex px-4 py-3 bg-white border-b border-gray-100 text-sm font-semibold text-gray-700 overflow-x-auto whitespace-nowrap">
        <button className="pb-2 border-b-2 border-yellow-500 text-yellow-500 mr-6 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75" onClick={() => showFeatureComingSoon("Spot Trading")}>Spot</button>
        <button className="pb-2 mr-6 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75" onClick={() => showFeatureComingSoon("Convert Trading")}>Convert</button>
        <button className="pb-2 mr-6 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75" onClick={() => showFeatureComingSoon("Margin Trading")}>Margin</button>
        <button className="pb-2 mr-6 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75" onClick={() => showFeatureComingSoon("Buy/Sell Quick Trade")}>Buy/Sell</button>
      </div>

      <div className="flex flex-grow bg-white">
        {/* Buy/Sell Interface */}
        <div className="w-1/2 p-4 border-r border-gray-100 flex flex-col">
          <div className="flex space-x-2 mb-4">
            <button
              className={`flex-1 py-2 rounded-md font-semibold text-sm transition-colors duration-200 ${
                buySellTab === 'Buy' ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75`}
              onClick={() => setBuySellTab('Buy')}
            >
              Buy
            </button>
            <button
              className={`flex-1 py-2 rounded-md font-semibold text-sm transition-colors duration-200 ${
                buySellTab === 'Sell' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75`}
              onClick={() => setBuySellTab('Sell')}
            >
              Sell
            </button>
          </div>

          {/* Order Type Selector */}
          <select
            className="w-full p-2 bg-gray-100 rounded-md mb-4 focus:outline-none focus:ring-1 focus:ring-yellow-400 text-gray-700 cursor-pointer"
            value={activeTradeTab}
            onChange={(e) => setActiveTradeTab(e.target.value)}
          >
            <option>Limit</option>
            <option>Market</option>
            <option>Stop-Limit</option>
          </select>

          {/* Price Input */}
          <div className="relative mb-4 flex items-center bg-gray-100 rounded-md border border-gray-200 focus-within:border-yellow-400 transition-colors duration-200">
            <button className="p-3 text-gray-600 hover:bg-gray-200 rounded-l-md transition-colors duration-200" onClick={() => handlePriceChange(-0.0001)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
              </svg>
            </button>
            <input
              type="number"
              placeholder="Price (USDT)"
              className="flex-1 p-3 bg-transparent focus:outline-none text-gray-800 placeholder-gray-500"
              value={tradePrice}
              onChange={(e) => setTradePrice(parseFloat(e.target.value) || 0)}
            />
            <button className="p-3 text-gray-600 hover:bg-gray-200 rounded-r-md transition-colors duration-200" onClick={() => handlePriceChange(0.0001)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m0 0H6" />
              </svg>
            </button>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pr-1">USDT</span>
          </div>

          {/* Amount Input */}
          <div className="relative mb-4 flex items-center bg-gray-100 rounded-md border border-gray-200 focus-within:border-yellow-400 transition-colors duration-200">
            <button className="p-3 text-gray-600 hover:bg-gray-200 rounded-l-md transition-colors duration-200" onClick={() => handleAmountChange(-1)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
              </svg>
            </button>
            <input
              type="number"
              placeholder="Amount (OM)"
              className="flex-1 p-3 bg-transparent focus:outline-none text-gray-800 placeholder-gray-500"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(parseFloat(e.target.value) || 0)}
            />
            <button className="p-3 text-gray-600 hover:bg-gray-200 rounded-r-md transition-colors duration-200" onClick={() => handleAmountChange(1)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m0 0H6" />
              </svg>
            </button>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pr-1">OM</span>
          </div>

          {/* Total Input */}
          <div className="relative mb-4">
            <input
              type="number"
              placeholder="Total (USDT)"
              className="w-full p-3 pr-10 bg-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-400 text-gray-800 placeholder-gray-500"
              value={(tradePrice * tradeAmount).toFixed(5)} // Calculate total based on price and amount
              readOnly
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">USDT</span>
          </div>

          <p className="text-xs text-gray-500 mb-4 cursor-pointer hover:text-gray-700" onClick={() => showFeatureComingSoon("Available Balance")}>Avbl: 0 USDT</p>

          <button
            className={`w-full py-3 rounded-md font-semibold text-lg transition-colors duration-200 ${
              buySellTab === 'Buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
            } text-white shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75`}
            onClick={() => showFeatureComingSoon(`${buySellTab} Order`)}
          >
            {buySellTab === 'Buy' ? 'Margin Buy' : 'Margin Sell'} OM
          </button>

          <p className="text-xs text-gray-600 mt-4 p-2 bg-yellow-50 rounded-md border border-yellow-200">
            <span className="font-semibold text-yellow-700">Risk Warning:</span> The price of this token is subject to high volatility.
          </p>
        </div>

        {/* Order Book */}
        <div className="w-1/2 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2 text-gray-600">
            <span className="text-xs">Price (USDT)</span>
            <span className="text-xs">Amount (OM)</span>
          </div>
          <div className="flex-1 overflow-y-auto text-sm">
            {dummyOrderBook.map((order, index) => (
              <div key={index} className={`flex justify-between py-0.5 ${order.type === 'sell' ? 'text-red-500' : (order.type === 'buy' ? 'text-green-500' : 'text-gray-800 font-bold')} hover:bg-gray-50 cursor-pointer`}
                   onClick={() => showFeatureComingSoon(`Order Book Entry for ${order.price}`)}>
                <span>{order.price}</span>
                <span>{order.amount || order.currentPrice}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-4 p-2 bg-gray-100 rounded-md">
            <p className="text-gray-800 font-bold text-lg">0.1996</p>
            <p className="text-gray-500 text-xs">≈ $0.1996</p>
          </div>
        </div>
      </div>

      {/* Open Orders/Positions */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex space-x-4 mb-3">
          <button className="font-semibold text-gray-700 pb-2 border-b-2 border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75" onClick={() => showFeatureComingSoon("Open Orders")}>Open Orders (0)</button>
          <button className="font-semibold text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75" onClick={() => showFeatureComingSoon("Positions")}>Positions (0)</button>
        </div>
        <p className="text-center text-gray-500 text-sm">No open orders</p>
      </div>

      {/* Chart Placeholder */}
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-sm border-t border-gray-100 hover:bg-gray-300 transition-colors duration-200 cursor-pointer" onClick={() => showFeatureComingSoon("TradingView Chart")}>
        OM/USDT Chart (TradingView Integration Placeholder)
      </div>
    </div>
  );
};

const WalletPage = ({ onAddFundsClick, onBackClick }) => {
  const [activeWalletTab, setActiveWalletTab] = useState('Overview');
  const [balanceVisible, setBalanceVisible] = useState(true);

  const walletTabs = ['Overview', 'Funding', 'Spot', 'Futures'];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header
        title=""
        showBack={true}
        onBackClick={onBackClick}
        showSettings={true}
        onSettingsClick={() => showFeatureComingSoon("Wallet Settings")}
        showSearch={false}
        showHeadphones={false}
      /> {/* Custom header for Wallet */}
      {/* Exchange/Wallet Tabs */}
      <div className="flex justify-center p-2 bg-white border-b border-gray-100">
        <button className="bg-gray-100 text-gray-700 font-semibold px-6 py-2 rounded-l-full hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75" onClick={() => showFeatureComingSoon("Switch to Exchange")}>Exchange</button>
        <button className="bg-yellow-500 text-white font-semibold px-6 py-2 rounded-r-full shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75" onClick={() => showFeatureComingSoon("Switch to Wallet")}>Wallet</button>
      </div>

      {/* Wallet Type Tabs (Overview, Funding, Spot, Futures) */}
      <div className="flex px-4 py-3 bg-white border-b border-gray-100 text-sm font-semibold text-gray-700 overflow-x-auto whitespace-nowrap">
        {walletTabs.map((tab) => (
          <button
            key={tab}
            className={`pb-2 mr-6 ${activeWalletTab === tab ? 'border-b-2 border-yellow-500 text-yellow-500' : 'hover:text-yellow-500'} focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75`}
            onClick={() => setActiveWalletTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Wallet Overview Content */}
      <div className="p-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xl text-gray-500">Est. Total Value</p>
            <div className="flex items-center">
              <p className="text-3xl font-bold text-gray-800">
                {balanceVisible ? '1.45' : '****'}
              </p>
              <select className="ml-2 font-semibold text-gray-800 bg-transparent focus:outline-none cursor-pointer" onChange={(e) => showFeatureComingSoon(`Selected Currency: ${e.target.value}`)}>
                <option>USDT</option>
                <option>BTC</option>
              </select>
            </div>
            <p className="text-sm text-gray-500">≈ ${balanceVisible ? '1.46' : '****'}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="text-gray-600 hover:text-gray-900 transition-colors duration-200" onClick={() => setBalanceVisible(!balanceVisible)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {balanceVisible ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7c.725 0 1.442.062 2.146.195M17.472 8.016A10.057 10.057 0 0121.542 12c-1.274 4.057-5.064 7-9.542 7a10.05 10.05 0 01-1.895-.175M8.25 11.25a3 3 0 116 0 3 3 0 01-6 0z" />
                )}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button className="text-gray-600 hover:text-gray-900 transition-colors duration-200" onClick={() => showFeatureComingSoon("Download Report")}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-green-500 text-sm font-semibold mb-4 cursor-pointer" onClick={() => showFeatureComingSoon("Today's PNL Details")}>Today's PNL +0.0013995 USDT (+0.10%)</p>
        <div className="flex justify-around space-x-4">
          <button
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
            onClick={onAddFundsClick}
          >
            Add Funds
          </button>
          <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75" onClick={() => showFeatureComingSoon("Send Crypto")}>
            Send
          </button>
          <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75" onClick={() => showFeatureComingSoon("Transfer Funds")}>
            Transfer
          </button>
        </div>
      </div>

      {/* Account Details */}
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4 text-sm font-semibold">
            <button className="pb-2 border-b-2 border-yellow-500 text-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75" onClick={() => showFeatureComingSoon("Crypto Balances")}>Crypto</button>
            <button className="pb-2 text-gray-700 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75" onClick={() => showFeatureComingSoon("Account Overview")}>Account</button>
          </div>
          <button className="text-gray-600 hover:text-gray-900 transition-colors duration-200" onClick={() => showFeatureComingSoon("Manage Accounts")}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.525.32 1.05.65 1.574 1.066z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors duration-200" onClick={() => showFeatureComingSoon("Funding Wallet Details")}>
            <div>
              <p className="text-lg font-semibold text-gray-800">Funding</p>
            </div>
            <p className="text-gray-800">{balanceVisible ? '1.45 USDT' : '**** USDT'}</p>
          </div>
          <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors duration-200" onClick={() => showFeatureComingSoon("Spot Wallet Details")}>
            <div>
              <p className="text-lg font-semibold text-gray-800">Spot</p>
            </div>
            <p className="text-gray-800">{balanceVisible ? '0.00122493 USDT' : '**** USDT'}</p>
          </div>
          <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors duration-200" onClick={() => showFeatureComingSoon("Futures Wallet Details")}>
            <div>
              <p className="text-lg font-semibold text-gray-800">Futures</p>
            </div>
            <p className="text-gray-800">{balanceVisible ? '0.00 USDT' : '**** USDT'}</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Your Assets</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {dummyWalletAssets.map((asset, index) => (
              <div key={index} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 cursor-pointer" onClick={() => showFeatureComingSoon(`Details for ${asset.currency}`)}>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getIcon(asset.currency)}</span>
                  <span className="font-medium text-gray-800">{asset.currency}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">{balanceVisible ? asset.total.toFixed(6) : '******'}</p>
                  <p className="text-xs text-gray-500">Available: {balanceVisible ? asset.available.toFixed(6) : '******'}</p>
                  <p className="text-xs text-gray-500">In Order: {balanceVisible ? asset.inOrder.toFixed(6) : '******'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// New Auth Pages
const LoginPage = ({ onLoginSuccess, onSignUpClick, onBackClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login success - in a real app, this would involve API calls
    showFeatureComingSoon("Login functionality (requires backend)");
    // onLoginSuccess(); // Uncomment this to simulate immediate login
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center p-4">
      <Header title="" showBack={true} onBackClick={onBackClick} showSearch={false} showHeadphones={false} showSettings={false} />
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Log In</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-shadow duration-200"
              id="email"
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded-md w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-shadow duration-200"
              id="password"
              type="password"
              placeholder="**********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 text-right cursor-pointer hover:text-yellow-500" onClick={() => showFeatureComingSoon("Forgot Password")}>Forgot Password?</p>
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors duration-200 w-full"
              type="submit"
            >
              Log In
            </button>
          </div>
        </form>
        <p className="text-center text-gray-600 text-sm mt-6">
          Don't have an account?{' '}
          <button className="text-yellow-500 font-bold hover:underline" onClick={onSignUpClick}>
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

const SignUpPage = ({ onSignUpSuccess, onLoginClick, onBackClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showFeatureComingSoon("Passwords do not match");
      return;
    }
    // Simulate sign-up success - in a real app, this would involve API calls
    showFeatureComingSoon("Sign Up functionality (requires backend)");
    // onSignUpSuccess(); // Uncomment this to simulate immediate sign up
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center p-4">
      <Header title="" showBack={true} onBackClick={onBackClick} showSearch={false} showHeadphones={false} showSettings={false} />
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Sign Up</h2>
        <form onSubmit={handleSignUp}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-shadow duration-200"
              id="email"
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded-md w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-shadow duration-200"
              id="password"
              type="password"
              placeholder="**********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirm-password">
              Confirm Password
            </label>
            <input
              className="shadow appearance-none border rounded-md w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-shadow duration-200"
              id="confirm-password"
              type="password"
              placeholder="**********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors duration-200 w-full"
              type="submit"
            >
              Sign Up
            </button>
          </div>
        </form>
        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{' '}
          <button className="text-yellow-500 font-bold hover:underline" onClick={onLoginClick}>
            Log In
          </button>
        </p>
      </div>
    </div>
  );
};

const KYCPage = ({ onBackClick }) => {
  const [docType, setDocType] = useState('');
  const [docFile, setDocFile] = useState(null);

  const handleFileChange = (e) => {
    setDocFile(e.target.files[0]);
  };

  const handleSubmitKYC = (e) => {
    e.preventDefault();
    showFeatureComingSoon("KYC document upload (requires backend)");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-4">
      <Header title="KYC Verification" showBack={true} onBackClick={onBackClick} showSearch={false} showHeadphones={false} showSettings={false} />
      <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Identity Verification (KYC)</h2>
        <p className="text-gray-600 text-sm mb-6">
          To unlock full features and increase limits, please complete your identity verification.
        </p>
        <form onSubmit={handleSubmitKYC}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="docType">
              Document Type
            </label>
            <select
              className="shadow border rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-shadow duration-200"
              id="docType"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              required
            >
              <option value="">Select a document type</option>
              <option value="passport">Passport</option>
              <option value="driver_license">Driver's License</option>
              <option value="national_id">National ID Card</option>
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="docFile">
              Upload Document (Front Side)
            </label>
            <input
              className="shadow appearance-none border rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-shadow duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
              id="docFile"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              required
            />
            {docFile && <p className="text-xs text-gray-500 mt-2">Selected: {docFile.name}</p>}
          </div>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors duration-200 w-full"
            type="submit"
          >
            Submit for Verification
          </button>
        </form>
      </div>
    </div>
  );
};

const TwoFAPage = ({ onBackClick }) => {
  const [qrCode, setQrCode] = useState('https://placehold.co/150x150/000/FFF?text=QR+Code'); // Placeholder QR
  const [setupKey, setSetupKey] = useState('ABCD-EFGH-IJKL-MNOP'); // Placeholder key
  const [otpCode, setOtpCode] = useState('');

  const handleEnable2FA = (e) => {
    e.preventDefault();
    showFeatureComingSoon("2FA Enable (requires backend)");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-4">
      <Header title="2FA Security" showBack={true} onBackClick={onBackClick} showSearch={false} showHeadphones={false} showSettings={false} />
      <div className="bg-white rounded-lg shadow-lg p-6 mt-4 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Enable Google Authenticator (TOTP)</h2>
        <p className="text-gray-600 text-sm mb-6">
          Scan the QR code with your Google Authenticator app or manually enter the setup key.
        </p>

        <div className="flex justify-center mb-6">
          <img src={qrCode} alt="QR Code" className="w-36 h-36 border border-gray-200 rounded-md p-2" />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="setupKey">
            Setup Key
          </label>
          <input
            className="shadow appearance-none border rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-shadow duration-200 text-center font-mono"
            id="setupKey"
            type="text"
            value={setupKey}
            readOnly
          />
          <button
            className="text-yellow-500 text-sm mt-2 hover:underline focus:outline-none"
            onClick={() => { navigator.clipboard.writeText(setupKey); showFeatureComingSoon("Copied to clipboard!"); }}
          >
            Copy to clipboard
          </button>
        </div>

        <form onSubmit={handleEnable2FA}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="otpCode">
              Enter 6-digit Code from Authenticator
            </label>
            <input
              className="shadow appearance-none border rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-shadow duration-200 text-center text-lg tracking-widest"
              id="otpCode"
              type="text"
              maxLength="6"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              required
            />
          </div>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors duration-200 w-full"
            type="submit"
          >
            Enable 2FA
          </button>
        </form>
      </div>
    </div>
  );
};


const ProfilePage = ({ onBackClick, onKYCClick, onTwoFAPageClick }) => (
  <div className="flex flex-col min-h-screen bg-gray-50">
    <Header
      title=""
      showBack={true}
      onBackClick={onBackClick}
      showSettings={true}
      onSettingsClick={() => showFeatureComingSoon("Profile Settings")}
      showSearch={true}
      onSearchClick={() => showFeatureComingSoon("Profile Search")}
      showHeadphones={true}
      onHeadphonesClick={() => showFeatureComingSoon("Profile Support")}
    />
    <div className="flex items-center p-4 bg-white border-b border-gray-100 shadow-sm">
      <img
        src="https://placehold.co/60x60/FFD700/000?text=P" // Profile placeholder
        alt="Profile"
        className="w-16 h-16 rounded-full mr-4 cursor-pointer"
        onClick={() => showFeatureComingSoon("Change Profile Picture")}
      />
      <div>
        <p className="text-xl font-bold text-gray-800">Remarkable</p>
        <p className="text-sm text-gray-500">ID: 519129637</p>
        <div className="flex space-x-2 mt-1">
          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-300 transition-colors duration-200" onClick={() => showFeatureComingSoon("Regular User Status")}>Regular</span>
          <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded-full cursor-pointer hover:bg-green-300 transition-colors duration-200" onClick={onKYCClick}>Verified</span>
        </div>
      </div>
    </div>

    {/* Security Section */}
    <div className="p-4 bg-white border-b border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Security</h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors duration-200" onClick={onTwoFAPageClick}>
          <div className="flex items-center space-x-3">
            <span className="text-xl text-blue-500">🔒</span>
            <span className="font-medium text-gray-800">Google Authenticator (2FA)</span>
          </div>
          <span className="text-sm text-gray-500">Not activated <span className="text-yellow-500">›</span></span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors duration-200" onClick={() => showFeatureComingSoon("Security Key")}>
          <div className="flex items-center space-x-3">
            <span className="text-xl text-indigo-500">🔑</span>
            <span className="font-medium text-gray-800">Security Key (WebAuthn)</span>
          </div>
          <span className="text-sm text-gray-500">Not activated <span className="text-yellow-500">›</span></span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors duration-200" onClick={() => showFeatureComingSoon("Passkey Management")}>
          <div className="flex items-center space-x-3">
            <span className="text-xl text-purple-500">✅</span>
            <span className="font-medium text-gray-800">Passkey</span>
          </div>
          <span className="text-sm text-gray-500">Manage <span className="text-yellow-500">›</span></span>
        </div>
      </div>
    </div>

    <div className="p-4 bg-white border-b border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Shortcut</h2>
      <div className="grid grid-cols-4 gap-4">
        <IconButton icon={<span className="text-yellow-500 text-xl">🏆</span>} label="Rewards Hub" onClick={() => showFeatureComingSoon("Rewards Hub")} />
        <IconButton icon={<span className="text-yellow-500 text-xl">🤝</span>} label="Referral" onClick={() => showFeatureComingSoon("Referral Program")} />
        <IconButton icon={<span className="text-yellow-500 text-xl">👑</span>} label="Traders League" onClick={() => showFeatureComingSoon("Traders League")} />
        <IconButton icon={<span className="text-yellow-500 text-xl">💰</span>} label="Earn" onClick={() => showFeatureComingSoon("Earn Products")} />
        <IconButton icon={<span className="text-gray-500 text-xl">✏️</span>} label="Edit" onClick={() => showFeatureComingSoon("Edit Profile")} />
      </div>
    </div>

    <div className="p-4 bg-white border-b border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Recommend</h2>
      <div className="grid grid-cols-4 gap-4">
        <IconButton icon={<span className="text-yellow-500 text-xl">👥</span>} label="P2P" onClick={() => showFeatureComingSoon("P2P Trading")} />
        <IconButton icon={<span className="text-yellow-500 text-xl">✨</span>} label="Alpha Events" onClick={() => showFeatureComingSoon("Alpha Events")} />
        <IconButton icon={<span className="text-yellow-500 text-xl">💸</span>} label="Simple Earn" onClick={() => showFeatureComingSoon("Simple Earn")} />
        <IconButton icon={<span className="text-yellow-500 text-xl">👑</span>} label="Traders League" onClick={() => showFeatureComingSoon("Traders League")} />
        <IconButton icon={<span className="text-yellow-500 text-xl">🤝</span>} label="Referral" onClick={() => showFeatureComingSoon("Referral Program")} />
        <IconButton icon={<span className="text-yellow-500 text-xl">🔲</span>} label="Square" onClick={() => showFeatureComingSoon("Square Community")}/>
      </div>
      <button className="w-full text-center text-sm font-semibold text-yellow-500 py-3 mt-4 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75" onClick={() => showFeatureComingSoon("More Services")}>
        More Services
      </button>
    </div>

    <div className="p-4 bg-white mt-4 rounded-md shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img
            src="https://placehold.co/20x20/FFD700/000?text=B" // Binance Lite logo
            alt="Binance Lite"
            className="w-5 h-5 rounded-full"
          />
          <p className="font-semibold text-gray-800">BINANCE <span className="text-yellow-500">Lite</span></p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-700 transition-colors duration-200 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" onClick={() => showFeatureComingSoon("Binance Lite Mode")}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  </div>
);


function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showProfile, setShowProfile] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showKYC, setShowKYC] = useState(false);
  const [show2FA, setShow2FA] = useState(false);

  const [hotPairs, setHotPairs] = useState(initialDummyHotPairs);
  const [marketPairs, setMarketPairs] = useState(initialDummyMarketPairs);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update hot pairs
      setHotPairs(prevPairs => prevPairs.map(pair => {
        const currentPrice = parseFloat(pair.price.replace(/,/g, ''));
        const volatility = currentPrice * 0.005; // 0.5% price change
        const newPrice = (Math.random() > 0.5 ? currentPrice + volatility * Math.random() : currentPrice - volatility * Math.random());
        const formattedNewPrice = newPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 });

        // Calculate change percentage
        const oldPrice = parseFloat(initialDummyHotPairs.find(p => p.name === pair.name).price.replace(/,/g, ''));
        const change = ((newPrice - oldPrice) / oldPrice) * 100;
        const formattedChange = `${change.toFixed(2)}%`;

        return {
          ...pair,
          price: formattedNewPrice,
          change: (change >= 0 ? '+' : '') + formattedChange,
          value: `$${newPrice.toFixed(2)}` // Update value based on new price
        };
      }));

      // Update market pairs
      setMarketPairs(prevPairs => prevPairs.map(pair => {
        const currentPrice = parseFloat(pair.price.replace(/,/g, ''));
        const volatility = currentPrice * 0.005; // 0.5% price change
        const newPrice = (Math.random() > 0.5 ? currentPrice + volatility * Math.random() : currentPrice - volatility * Math.random());
        const formattedNewPrice = newPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 });

        // Calculate change percentage
        const oldPrice = parseFloat(initialDummyMarketPairs.find(p => p.name === pair.name).price.replace(/,/g, ''));
        const change = ((newPrice - oldPrice) / oldPrice) * 100;
        const formattedChange = `${change.toFixed(2)}%`;

        return {
          ...pair,
          price: formattedNewPrice,
          change: (change >= 0 ? '+' : '') + formattedChange,
        };
      }));

    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []); // Empty dependency array means this runs once on mount

  // This useEffect would typically handle Firebase initialization and auth state changes
  // For this frontend-only example, it's just a placeholder.
  useEffect(() => {
    // try {
    //   app = initializeApp(firebaseConfig);
    //   db = getFirestore(app);
    //   auth = getAuth(app);
    //
    //   const signIn = async () => {
    //     if (typeof __initial_auth_token !== 'undefined') {
    //       await signInWithCustomToken(auth, __initial_auth_token);
    //     } else {
    //       await signInAnonymously(auth);
    //     }
    //     // console.log('Firebase Auth Ready');
    //   };
    //
    //   signIn();
    //
    //   // Optional: Listen for auth state changes if needed for real-time auth
    //   // onAuthStateChanged(auth, (user) => {
    //   //   if (user) {
    //   //     console.log('User is signed in', user.uid);
    //   //   } else {
    //   //     console.log('User is signed out');
    //   //   }
    //   // });
    // } catch (error) {
    //   console.error("Firebase initialization error:", error);
    // }
  }, []);

  const handleAddFundsClick = () => {
    showFeatureComingSoon("Add Funds");
  };

  const handleProfileClick = () => {
    setShowProfile(true);
    setShowLogin(false);
    setShowSignUp(false);
    setShowKYC(false);
    setShow2FA(false);
  };

  const handleBackFromProfile = () => {
    setShowProfile(false);
    setActiveTab('home'); // Go back to home after exiting profile/auth pages
  };

  const handleLoginClick = () => {
    setShowLogin(true);
    setShowSignUp(false);
    setShowProfile(false);
    setShowKYC(false);
    setShow2FA(false);
  };

  const handleSignUpClick = () => {
    setShowSignUp(true);
    setShowLogin(false);
    setShowProfile(false);
    setShowKYC(false);
    setShow2FA(false);
  };

  const handleKYCClick = () => {
    setShowKYC(true);
    setShowProfile(false);
    setShowLogin(false);
    setShowSignUp(false);
    setShow2FA(false);
  };

  const handleTwoFAPageClick = () => {
    setShow2FA(true);
    setShowProfile(false);
    setShowKYC(false);
    setShowLogin(false);
    setShowSignUp(false);
  };

  const handleAuthSuccess = () => {
    // In a real app, this would set user state and redirect to dashboard
    alert('Authentication successful! Redirecting to home.');
    setShowLogin(false);
    setShowSignUp(false);
    setActiveTab('home');
  };


  const renderContent = () => {
    if (showLogin) {
      return <LoginPage onLoginSuccess={handleAuthSuccess} onSignUpClick={handleSignUpClick} onBackClick={() => setShowLogin(false) || setShowProfile(true)} />;
    }
    if (showSignUp) {
      return <SignUpPage onSignUpSuccess={handleAuthSuccess} onLoginClick={handleLoginClick} onBackClick={() => setShowSignUp(false) || setShowProfile(true)} />;
    }
    if (showKYC) {
      return <KYCPage onBackClick={() => setShowKYC(false) || setShowProfile(true)} />;
    }
    if (show2FA) {
      return <TwoFAPage onBackClick={() => setShow2FA(false) || setShowProfile(true)} />;
    }
    if (showProfile) {
      return <ProfilePage onBackClick={handleBackFromProfile} onKYCClick={handleKYCClick} onTwoFAPageClick={handleTwoFAPageClick} />;
    }
    switch (activeTab) {
      case 'home':
        return <HomePage onAddFundsClick={handleAddFundsClick} onProfileClick={handleProfileClick} hotPairs={hotPairs} />;
      case 'markets':
        return <MarketsPage marketPairs={marketPairs} />;
      case 'trade':
        return <TradePage />;
      case 'wallet':
        return <WalletPage onAddFundsClick={handleAddFundsClick} onBackClick={() => setActiveTab('home')} />; // Back from wallet goes to home
      case 'futures':
        return (
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <p className="text-xl text-gray-600">Futures trading coming soon!</p>
          </div>
        );
      default:
        return <HomePage onAddFundsClick={handleAddFundsClick} onProfileClick={handleProfileClick} hotPairs={hotPairs} />;
    }
  };

  return (
    <div className="font-sans antialiased bg-gray-50 text-gray-800">
      <style>{`
        body {
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding-bottom: 70px; /* Space for the bottom nav bar */
          background-color: #f8f8f8;
        }
        /* Custom scrollbar for better aesthetics */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
      <div className="max-w-md mx-auto bg-white shadow-lg overflow-hidden md:rounded-lg">
        {renderContent()}
      </div>
      <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
