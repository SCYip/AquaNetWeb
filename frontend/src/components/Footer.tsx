import { Link } from 'react-router-dom'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-ocean-900 text-ocean-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-sea-500 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 12h4l2-4 2 8 2-4h0"/>
                </svg>
              </div>
              <span className="font-heading text-lg font-bold text-white">AquaNet 水眸</span>
            </div>
            <p className="text-sm text-ocean-400 leading-relaxed max-w-xs">
              一个由高中生发起的公民科学项目，用科技与社群的力量共同守护身边的水环境。
            </p>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold text-white uppercase tracking-wider mb-4">快速链接</h4>
            <div className="space-y-2">
              {[
                { to: '/', label: '首页' },
                { to: '/about', label: '关于我们' },
                { to: '/map', label: '实时地图' },
                { to: '/contact', label: '联系我们' },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm text-ocean-400 hover:text-sea-400 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold text-white uppercase tracking-wider mb-4">关于项目</h4>
            <p className="text-sm text-ocean-400 leading-relaxed">
              从一个旁观者，变成"公民科学家"。<br />
              守护水环境，从"看见"开始。
            </p>
            <p className="text-xs text-ocean-500 mt-4">
              © {currentYear} AquaNet 水眸 · 公民科学项目
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
