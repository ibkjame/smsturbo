import React from 'react';

const NumericKeypad = ({ value, onChange, maxLength = 6 }) => {
  const handlePress = (num) => {
    if (value.length < maxLength) {
      onChange(value + num);
    }
  };
  const handleBackspace = () => {
    if (value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };
  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <div className="mb-2 text-center text-gray-400 text-sm">กรุณากรอกรหัสผ่าน เป็นตัวเลข {maxLength} หลัก ({value.length}/{maxLength})</div>
      <div className="flex flex-col gap-3">
        {[0,1,2].map(row => (
          <div key={row} className="flex gap-3">
            {[1,2,3].map(col => {
              const n = row * 3 + col;
              if (n > 9) return null;
              return (
                <button
                  key={n}
                  type="button"
                  className="w-16 h-12 rounded-full border border-gray-300 bg-gray-800 text-2xl text-white font-bold hover:bg-orange-500 hover:text-black transition"
                  onClick={() => handlePress(n.toString())}
                  tabIndex={-1}
                >{n}</button>
              );
            })}
          </div>
        ))}
        <div className="flex gap-3">
          <button type="button" className="w-16 h-12 rounded-full border border-gray-300 bg-gray-800 text-xl text-white hover:bg-orange-500 hover:text-black transition" tabIndex={-1} disabled>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </button>
          <button type="button" className="w-16 h-12 rounded-full border border-gray-300 bg-gray-800 text-2xl text-white font-bold hover:bg-orange-500 hover:text-black transition" onClick={() => handlePress('0')} tabIndex={-1}>0</button>
          <button type="button" className="w-16 h-12 rounded-full border border-gray-300 bg-gray-800 text-2xl text-white font-bold hover:bg-red-500 hover:text-white transition" onClick={handleBackspace} tabIndex={-1}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        {[...Array(maxLength)].map((_, i) => (
          <div key={i} className={`w-4 h-4 rounded-full border ${i < value.length ? 'bg-orange-500 border-orange-500' : 'bg-gray-700 border-gray-400'}`}></div>
        ))}
      </div>
    </div>
  );
};

export default NumericKeypad;
