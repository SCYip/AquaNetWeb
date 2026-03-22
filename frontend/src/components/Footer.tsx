import { Link } from 'react-router-dom'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-400 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <img 
              src="/aquanet-logo.png" 
              alt="AquaNet Logo" 
              className="h-8 w-auto mr-2"
            />
            <span className="font-semibold text-gray-200">AquaNet</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 mb-4 md:mb-0">
            <Link to="/" className="hover:text-white transition-colors">首页</Link>
            <Link to="/about" className="hover:text-white transition-colors">关于我们</Link>
            <Link to="/map" className="hover:text-white transition-colors">实时地图</Link>
            <Link to="/contact" className="hover:text-white transition-colors">联系</Link>
          </div>
          
          <p className="text-sm">© {currentYear} AquaNet 水眸 · 公民科学项目 · 保护水资源</p>
        </div>
      </div>
    </footer>
  )
}
