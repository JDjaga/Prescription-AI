import React, { useState } from 'react';

const tabs = [
  'Upload',
  'Explanation',
  'Remedies',
  'AI Chat',
  'Journal',
];

type DemoTabsProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const DemoTabs: React.FC<DemoTabsProps> = ({ activeTab, setActiveTab }) => (
  <div className="flex w-fit mx-auto rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
    {tabs.map((tab, idx) => {
      const isActive = tab === activeTab;
      return (
        <button
          key={tab}
          type="button"
          className={
            `px-7 py-3 text-base font-semibold transition-all duration-200 select-none focus:outline-none ` +
            (isActive
              ? 'bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 text-white shadow-md'
              : 'text-gray-500 hover:bg-gray-50')
          }
          style={{
            borderTopLeftRadius: idx === 0 ? '1rem' : 0,
            borderBottomLeftRadius: idx === 0 ? '1rem' : 0,
            borderTopRightRadius: idx === tabs.length - 1 ? '1rem' : 0,
            borderBottomRightRadius: idx === tabs.length - 1 ? '1rem' : 0,
            cursor: 'pointer',
          }}
          aria-pressed={isActive}
          tabIndex={0}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </button>
      );
    })}
  </div>
);


export default DemoTabs;
