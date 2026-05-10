import { Link } from 'react-router-dom'
import { Droplets, Users, BarChart2, Globe2, Heart, Zap, ArrowRight, Award } from 'lucide-react'

export const AboutPage = () => {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="bg-ocean-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-sea-500/20 border border-sea-400/30 rounded-full px-5 py-2 text-sea-300 text-sm mb-6 font-medium">
            <Heart className="w-4 h-4" />
            关于我们 · About Us
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 leading-tight text-white">
            我们是<br />
            <span className="text-sea-400">AquaNet 水眸</span>
          </h1>
          <p className="text-lg text-ocean-200 max-w-2xl mx-auto">
            一个由高中生发起的公民科学项目，用科技与社群的力量，共同守护身边的水环境。
          </p>
        </div>
      </div>

      {/* Founder's Story */}
      <div className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-sea-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-sea-600" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-ocean-900">发起人故事</h2>
          </div>

          <div className="bg-gradient-to-br from-sea-50 to-ocean-50 rounded-2xl p-8 md:p-10 border border-sea-100">
            <div className="flex items-start gap-6">
              <div className="hidden md:flex flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-sea-400 to-ocean-500 items-center justify-center text-white text-2xl font-bold shadow-lg">
                J
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold text-ocean-900 mb-3">Joey · 11年级 · 广东惠州</h3>
                <p className="text-ocean-600 leading-relaxed mb-3">
                  我是 Joey，17岁，一名来自广东惠州的高中生。因为对环境科学的浓厚兴趣，我从小对"水环境"格外关注。
                </p>
                <p className="text-ocean-600 leading-relaxed mb-3">
                  让我真正下定决心发起 AquaNet 这个项目的，恰恰是一次科研中"被卡住"的经历——去年，在水体富营养化的研究项目中，我满心希望能深入分析藻华的成因与治理方法。但项目刚起步，一个意想不到的障碍就出现了：
                  <strong className="text-ocean-900">我很难找到我想研究水域的具体指标，水质数据覆盖的河流太少了。</strong>
                </p>
                <p className="text-ocean-600 leading-relaxed mb-3">
                  那一刻我意识到，水污染不仅是教科书上的概念，更是发生在我们身边的现实，但我们对它的了解却隔着一层厚重的迷雾。如果连"看见"都如此困难，后续的关心与保护又从何谈起？
                </p>
                <p className="text-ocean-800 leading-relaxed font-medium">
                  这次挫败，结合我从小因家庭水处理背景而对水科技产生的兴趣，让我萌生了一个想法：能否创造一个工具，让获取水质数据不再困难？这正是 AquaNet 水眸项目的起点。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="bg-sand-50 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="section-label">我们的使命</span>
            <h2 className="text-3xl font-heading font-bold text-ocean-900 mb-3">每个人都能成为"公民科学家"</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card-hover">
              <div className="w-14 h-14 rounded-2xl bg-ocean-100 flex items-center justify-center mb-5">
                <Users className="w-7 h-7 text-ocean-600" />
              </div>
              <h3 className="text-xl font-heading font-bold text-ocean-900 mb-3">提升公众参与感</h3>
              <p className="text-ocean-600 leading-relaxed text-sm">
                任何对所在社区，特别是深圳的"水环境"感兴趣的小伙伴，可以通过项目更好地了解自己生活居住场所附近水体的水质情况。真正从一个旁观者，变成"公民科学家"。
              </p>
            </div>

            <div className="card-hover">
              <div className="w-14 h-14 rounded-2xl bg-sea-100 flex items-center justify-center mb-5">
                <BarChart2 className="w-7 h-7 text-sea-600" />
              </div>
              <h3 className="text-xl font-heading font-bold text-ocean-900 mb-3">汇聚水质数据</h3>
              <p className="text-ocean-600 leading-relaxed text-sm">
                通过大家的共同参与，我们将搜集更广泛的水质数据。这些一手数据，对于更好地动态检测和管理所在社区的"水环境"将起到积极的作用。还能实时监控你家附近水体的健康状况。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why We Do This */}
      <div className="bg-ocean-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="section-label text-sea-400">为什么我们这样做</span>
            <h2 className="text-3xl font-heading font-bold text-white">Why We Do This</h2>
          </div>

          <div className="bg-ocean-800/50 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-ocean-700">
            <p className="text-ocean-200 leading-loose text-lg">
              在我们看来，<strong className="text-white">Z世代面对环境问题最大的特点</strong>就是不满足于只停留在焦虑或抱怨，而是倾向于利用技术手段，自下而上地创造解决方案。我们更习惯用自己学的编程、硬件设计、数据分析这些技能去捣鼓点实际的东西，相信普通人的集体行动能汇聚成巨大的改变。
            </p>
            <p className="text-sea-400 font-semibold mt-4 text-center text-lg">
              当越来越多人参与进来，我们就能形成一个强大的社群，共同为"水保护"发声。
            </p>
          </div>
        </div>
      </div>

      {/* How to Participate */}
      <div className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="section-label">参与方式</span>
            <h2 className="text-3xl font-heading font-bold text-ocean-900 mb-3">每个人都能参与</h2>
            <p className="text-ocean-600">别觉得一个人行动没用，每个微小的行动，汇聚起来就是巨大的力量。</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <Users className="w-5 h-5" />, title: '加入我们', desc: '积极参与 AquaNet 水眸，或其它水保护项目，一群人为一个目标一起努力。' },
              { icon: <Droplets className="w-5 h-5" />, title: '改变生活习惯', desc: '减少使用含磷日用品，不向河道乱扔垃圾，节约用水。' },
              { icon: <Globe2 className="w-5 h-5" />, title: '传播知识', desc: '主动了解水环境保护知识，并向家人、朋友、社区居民宣传。' },
              { icon: <Zap className="w-5 h-5" />, title: '举报污染', desc: '发现污染水源的行为，可以向环保部门举报。' },
              { icon: <BarChart2 className="w-5 h-5" />, title: '贡献数据', desc: '通过我们的小程序或设备，提交你发现的水质数据。' },
              { icon: <Heart className="w-5 h-5" />, title: '关注与分享', desc: '关注我们的公众号，了解最新动态，一次分享就是一份力量。' },
            ].map((item, i) => (
              <div key={i} className="bg-sand-50 rounded-xl p-6 hover:bg-sea-50 transition-colors border border-sand-100 hover:border-sea-200">
                <div className="text-sea-600 mb-3 bg-sea-100 w-fit p-2.5 rounded-lg">
                  {item.icon}
                </div>
                <h3 className="font-heading font-bold text-ocean-900 mb-2">{item.title}</h3>
                <p className="text-ocean-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-sand-50 py-20">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-3xl font-heading font-bold text-ocean-900 mb-4">一起探索与保护"生命之源"</h2>
          <p className="text-ocean-600 mb-8">
            无论你是否了解水质监测，都欢迎你加入我们。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/map" className="btn-primary text-base px-10 py-3.5">
              查看实时地图
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/contact" className="btn-secondary text-base px-10 py-3.5">
              联系我们
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
