import { Link } from 'react-router-dom'
import { Droplets, Users, Globe2, ArrowRight, Heart, Sparkles, Map as MapIcon } from 'lucide-react'

export const HomePage = () => {
  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero - Environmental mission first */}
      <div className="bg-gradient-to-b from-teal-900 via-blue-900 to-blue-800 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-400/30 rounded-full px-4 py-1.5 text-teal-300 text-sm mb-8">
            <Heart className="w-4 h-4" />
            一个由高中生发起的公民科学项目
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            守护身边的水环境，<br />
            <span className="text-cyan-400">从"看见"开始。</span>
          </h1>
          <p className="mt-4 text-xl text-blue-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            AquaNet 水眸是一个公民科学项目，致力于让水质数据触手可及，
            让每个人都能成为自己社区水环境的守护者。
          </p>
          <div className="flex justify-center space-x-4 flex-wrap gap-4">
            <Link to="/about" className="btn-primary">
              <Sparkles className="mr-2 h-5 w-5" />
              了解更多
            </Link>
            <Link to="/map" className="btn-secondary">
              <MapIcon className="mr-2 h-5 w-5" />
              实时地图
            </Link>
          </div>
        </div>
      </div>

      {/* Joey's Quote */}
      <div className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="text-5xl text-cyan-400 mb-4 leading-none">"</div>
          <blockquote className="text-xl md:text-2xl text-gray-700 font-medium leading-relaxed mb-6">
            如果连"看见"水质都如此困难，后续的关心与保护又从何谈起？
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
              J
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Joey</p>
              <p className="text-sm text-gray-500">AquaNet 水眸发起人 · 广东惠州</p>
            </div>
          </div>
        </div>
      </div>

      {/* What is AquaNet */}
      <div className="py-20 bg-gray-50 text-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">什么是 AquaNet 水眸</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              从一个旁观者，变成"公民科学家"。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="card hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <Droplets className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">让数据触手可及</h3>
              <p className="text-gray-600 leading-relaxed">
                水质数据不应只存在于政府报告里。通过我们的传感器网络和公众平台，
                每个普通人都能实时了解身边水体的健康状况。
              </p>
            </div>

            <div className="card hover:shadow-lg transition-shadow">
              <div className="bg-teal-100 p-4 rounded-full mb-4">
                <Users className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">汇聚社群力量</h3>
              <p className="text-gray-600 leading-relaxed">
                Z世代不满足于空谈环保，我们用编程、硬件、数据分析，
                自下而上地创造解决方案。相信普通人的集体行动能汇聚成巨大的改变。
              </p>
            </div>

            <div className="card hover:shadow-lg transition-shadow">
              <div className="bg-cyan-100 p-4 rounded-full mb-4">
                <Globe2 className="h-8 w-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">科学保护水环境</h3>
              <p className="text-gray-600 leading-relaxed">
                一手水质数据对于动态检测和管理社区水环境至关重要。
                我们用技术手段，让每一次保护行动都有数据支撑。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why It Matters */}
      <div className="py-20 bg-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">为什么水质数据如此重要？</h2>
              <div className="space-y-4 text-blue-100">
                <p className="leading-relaxed">
                  去年，在水体富营养化的研究项目中，发起人 Joey 满心希望能深入分析藻华的成因与治理方法。
                  但项目刚起步，一个意想不到的障碍就出现了——
                </p>
                <p className="leading-relaxed text-white font-medium">
                  我很难找到我想研究水域的具体指标，水质数据覆盖的河流太少了。
                </p>
                <p className="leading-relaxed">
                  那一刻我们意识到：水污染不仅是教科书上的概念，更是发生在我们身边的现实，
                  但我们对它的了解却隔着一层厚重的迷雾。
                </p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="font-bold text-lg mb-4 text-cyan-300">这正是 AquaNet 水眸的起点</h3>
              <ul className="space-y-3 text-blue-100">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0"></span>
                  <span>创造一个工具，让获取水质数据不再困难</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0"></span>
                  <span>汇聚社群力量，用科技手段参与环保</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0"></span>
                  <span>让每个人都能实时监控身边的水体健康</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0"></span>
                  <span>用一手数据支撑科学决策</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Live Map Preview */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">实时水质地图</h2>
            <p className="mt-3 text-gray-600">
              点击地图上的浮标点，查看深圳周边水域的温度、pH 值和浊度数据。
            </p>
          </div>

          <Link to="/map" className="block group">
            <div className="bg-gradient-to-br from-blue-800 to-teal-700 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.01]">
              <div className="p-8 md:p-12 text-white">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">深圳周边水域实时数据</h3>
                  <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    Live · 实时更新
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-cyan-300 mb-1">5</div>
                    <div className="text-sm text-blue-200">监测浮标</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-cyan-300 mb-1">3</div>
                    <div className="text-sm text-blue-200">水质指标</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-cyan-300 mb-1">24/7</div>
                    <div className="text-sm text-blue-200">持续监测</div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-blue-200 group-hover:text-white transition-colors">
                  <span className="font-medium">打开地图</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 bg-white">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            不要小看每一个人的力量
          </h2>
          <p className="text-gray-600 mb-4 text-lg">
            你的一次关注、一次分享、一次参与，<br />
            都可能成为改变我们共同水环境的重要一"滴"。
          </p>
          <p className="text-gray-500 mb-8">
            无论你是否了解水质监测，都欢迎你加入我们。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/about" className="btn-primary justify-center">
              了解更多项目故事
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/contact" className="btn-secondary justify-center">
              联系我们
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
