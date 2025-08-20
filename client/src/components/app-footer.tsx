export function AppFooter() {
  return (
    <footer className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-lg">
        <img 
          src="/ntt-data-logo.png" 
          alt="NTT Data" 
          className="h-5 w-auto object-contain"
          onLoad={() => console.log('NTT Data footer logo loaded successfully')}
          onError={(e) => {
            console.error('NTT Data logo failed to load');
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="text-xs text-gray-600 font-medium">
          Customized for NTT Data
        </div>
      </div>
    </footer>
  );
}