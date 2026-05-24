import { Link } from 'react-router-dom'

export const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-ink text-canvas mt-32">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16 grid grid-cols-12 gap-y-10 md:gap-x-10">
        <div className="col-span-12 md:col-span-6">
          <Link to="/" className="font-display text-3xl text-canvas leading-none">
            AquaNet <span className="italic">水眸</span>
          </Link>
          <p className="mt-5 max-w-md text-canvas/75 leading-relaxed">
            一份用开源浮标、公开地图、公众来信组成的公民观测站。
          </p>
        </div>

        <div className="col-span-6 md:col-span-3 space-y-3">
          {[
            { to: '/',         label: '首页'  },
            { to: '/about',    label: '关于'  },
            { to: '/map',      label: '实时地图' },
            { to: '/contact',  label: '联系'  },
          ].map(link => (
            <Link key={link.to} to={link.to} className="block text-canvas/80 hover:text-canvas transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="col-span-6 md:col-span-3 space-y-1">
          <div className="meta text-canvas/60">编辑部</div>
          <div className="text-canvas">深圳</div>
          <a href="mailto:contact@aquanet.io" className="text-canvas/80 hover:text-canvas transition-colors block mt-2">
            contact@aquanet.io
          </a>
        </div>
      </div>

      <div className="border-t border-canvas/15">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-5 meta text-canvas/55">
          © {year} AquaNet 水眸
        </div>
      </div>
    </footer>
  )
}
