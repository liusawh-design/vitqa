/* vitqa i18n - Multi-language support (48 Modes) with Detail Data */

// ─── Detail Data for zh-CN ────────────────────────────────
const MODE_DETAILS_ZH = [
  // Spectral (0-11)
  { best_for: '适合对音质要求极高的场景', pipeline: '归一化, HPSS分离, 频谱滤波, 底噪注入, 编码输出', quality: 5, detection: 1, long_desc: '温和的HPSS谐波分离处理，仅对背景层做极轻度的频谱滤波。人声近乎无损，适合对音质有严苛要求的创作者。' },
  { best_for: '人声为主的AI音乐，通用推荐', pipeline: '归一化, HPSS分离, 中值滤波, 感知编码, 输出', quality: 4, detection: 3, long_desc: '均衡的HPSS方案，在保持人声质感的同时提供中等绕过强度。适用于大多数AI检测场景，是频谱系列最均衡的选择。' },
  { best_for: '检测严格平台，追求高通过率', pipeline: '归一化, HPSS分离, 深度滤波, 特征重塑, 编码输出', quality: 3, detection: 4, long_desc: '强效HPSS处理，通过深度中值滤波和频谱特征重塑大幅改变背景层统计分布。适合检测严格的平台。' },
  { best_for: '快速处理，轻量级频谱扰动', pipeline: '归一化, 频谱分析, 扰动注入, 相位调整, 编码输出', quality: 5, detection: 2, long_desc: '温和的频谱扰动处理，通过轻微改变频谱相位和幅度分布来混淆检测器。几乎不影响听觉体验。' },
  { best_for: '频谱类处理入门推荐', pipeline: '归一化, 频谱扰动, 统计对齐, 编码输出', quality: 4, detection: 3, long_desc: '适中的频谱扰动，结合统计分布对齐技术，在不显著影响音质的前提下提供有效的绕过能力。' },
  { best_for: '高检测风险场景，强效特征混淆', pipeline: '归一化, 深度频谱扰动, 相位随机化, 统计归一化, 编码', quality: 3, detection: 4, long_desc: '深度频谱扰动方案，通过大幅改变频谱统计特征实现强效混淆。适用于高检测风险的场景。' },
  { best_for: '保留原始风格的轻量处理', pipeline: '归一化, STFT变换, 幅度保留, 相位重合成, 编码输出', quality: 5, detection: 1, long_desc: '基于STFT的温和重新合成，主要调整相位信息而保持幅度谱不变。人耳几乎无法感知变化。' },
  { best_for: '需要平衡音质与绕过', pipeline: '归一化, STFT变换, 相位-幅度调整, 频谱平滑, 编码输出', quality: 4, detection: 3, long_desc: '均衡的相位-幅度重合成方案，同时调整频谱的幅度和相位分布，实现视觉和听觉的平衡。' },
  { best_for: '大幅改变频谱特征', pipeline: '归一化, STFT变换, 深度重合成, 频谱重塑, 编码输出', quality: 3, detection: 4, long_desc: '深度重合成处理，大幅度改变音频频谱特征。适用于需要彻底改变检测模型判断的场景。' },
  { best_for: '保持音色特征的最佳选择', pipeline: '归一化, 共振峰检测, 微偏移, 频谱包络调整, 编码', quality: 5, detection: 2, long_desc: '温和的共振峰偏移，仅调整极小范围的频谱包络。完美保留原始音色特征，适合对音色敏感的音乐。' },
  { best_for: '适中调整，兼顾音色与绕过', pipeline: '归一化, 共振峰检测, 中等偏移, 包络重塑, 编码', quality: 4, detection: 3, long_desc: '均衡的共振峰调整方案，在保留音色可识别性的同时有效混淆检测模型对频谱特征的识别。' },
  { best_for: '强力改变人声特征', pipeline: '归一化, 共振峰检测, 深度偏移, 频谱重塑, 编码', quality: 3, detection: 4, long_desc: '强共振峰重塑，大幅偏移共振峰频率和带宽。适合需要深度改变人声特征的场景。' },
  // Temporal (12-23)
  { best_for: '节奏感强的音乐', pipeline: '归一化, 时域分析, 微抖动注入, 低通滤波, 编码输出', quality: 5, detection: 1, long_desc: '温和的时域抖动处理，通过微小的采样点时序扰动来改变时域特征。几乎不可感知。' },
  { best_for: '人声和器乐混合的作品', pipeline: '归一化, 时域分析, 中等抖动, 时域平滑, 编码输出', quality: 4, detection: 3, long_desc: '适中的时域抖动参数，在保持听觉连贯性的同时有效改变时域统计特征。' },
  { best_for: '电子音乐和打击乐为主的作品', pipeline: '归一化, 深度抖动, 时域重塑, 统计对齐, 编码输出', quality: 3, detection: 4, long_desc: '强效时域抖动，大幅改变采样点时序分布。适合需要强力改变时域特征的场景。' },
  { best_for: '保持原始节奏和动态', pipeline: '归一化, 瞬态检测, 微整形, 动态保留, 编码输出', quality: 5, detection: 2, long_desc: '温和的瞬态整形，对打击乐瞬态仅做极小的调整。完美保持原始节奏感和动态范围。' },
  { best_for: '需要平衡音质和绕过的综合场景', pipeline: '归一化, 瞬态检测, 中等整形, 包络调整, 编码输出', quality: 4, detection: 3, long_desc: '均衡的瞬态处理方案，对打击乐瞬态和尾音进行适度调整。兼顾音质与绕过效果。' },
  { best_for: '打击乐为主的音乐类型', pipeline: '归一化, 瞬态检测, 深度整形, 特征重塑, 编码输出', quality: 3, detection: 4, long_desc: '强瞬态重塑，大幅改变打击乐瞬态的时域和频域特征。适合需要深度改变节奏层特征的场景。' },
  { best_for: '轻柔缓慢的音乐风格', pipeline: '归一化, WSOLA分析, 微拉伸, 重叠处理, 编码输出', quality: 5, detection: 1, long_desc: '微幅时间拉伸处理，变化幅度极小。采用WSOLA算法确保时域连续性不受影响。' },
  { best_for: '慢速到中速音乐', pipeline: '归一化, WSOLA分析, 中等拉伸, 时域平滑, 编码输出', quality: 4, detection: 3, long_desc: '适中的WSOLA时间拉伸方案，在保持听觉自然度的同时有效改变时域速率特征。' },
  { best_for: '需要大幅改变速率特征', pipeline: '归一化, WSOLA分析, 深度拉伸, 重叠优化, 编码输出', quality: 3, detection: 4, long_desc: '大幅时间拉伸处理，显著改变音频的时域速率特征。适用于需要深度时域变换的场景。' },
  { best_for: '增加温暖感的音乐', pipeline: '归一化, 谐波分析, 微饱和, 动态控制, 编码输出', quality: 5, detection: 2, long_desc: '温和的谐波饱和处理，通过软膝饱和增加细微的谐波温暖感。在提升听感的同时实现基础绕过。' },
  { best_for: '通用场景的饱和处理', pipeline: '归一化, 谐波分析, 中等饱和, 谐波整形, 编码输出', quality: 4, detection: 3, long_desc: '均衡的谐波失真方案，适度引入谐波失真改变频谱谐波结构。适合大多数音乐类型。' },
  { best_for: '摇滚和电子等重音乐', pipeline: '归一化, 谐波分析, 深度饱和, 失真控制, 编码输出', quality: 3, detection: 4, long_desc: '强饱和失真处理，大幅改变谐波结构。适合本身谐波丰富的重音乐类型。' },
  // Psychoacoustic (24-35)
  { best_for: '对音质要求最高的场景', pipeline: '归一化, 心理声学分析, 微噪声注入, 掩蔽阈值, 编码', quality: 5, detection: 2, long_desc: '极低电平的心理声学噪声注入，噪声信号被掩蔽在人耳感知阈值之下。不影响主观听感。' },
  { best_for: '通用心理声学方案', pipeline: '归一化, 心理声学模型, 噪声整形, 阈值优化, 编码输出', quality: 4, detection: 3, long_desc: '基于感知阈值优化的噪声掩蔽方案，噪声频谱形状经过精密整形，在不影响可听度的前提下实现有效绕过。' },
  { best_for: '高检测风险场景', pipeline: '归一化, 心理声学模型, 深度噪声, 统计对齐, 编码输出', quality: 3, detection: 4, long_desc: '高掩蔽深度的噪声注入，大幅改变背景噪声特征。适用于检测风险较高的平台。' },
  { best_for: '轻柔细腻的音乐类型', pipeline: '归一化, 掩蔽模型, 微偏移, 感知优化, 编码输出', quality: 5, detection: 2, long_desc: '温和的掩蔽阈值偏移，通过微调人耳掩蔽曲线来改变音频感知特征。对听觉体验影响极小。' },
  { best_for: '通用场景的感知掩蔽', pipeline: '归一化, 掩蔽模型, 中等偏移, 频谱调整, 编码输出', quality: 4, detection: 3, long_desc: '均衡的感知掩蔽方案，适度调整掩蔽阈值和频谱分布。适合大多数音乐类型和检测环境。' },
  { best_for: '需要强效绕过能力的场景', pipeline: '归一化, 深度掩蔽模型, 频谱重塑, 统计归一化, 编码', quality: 3, detection: 4, long_desc: '深度掩蔽处理，基于高级感知模型重塑频谱特征。适用于需要强力绕过能力的场景。' },
  { best_for: '复杂编曲的音乐', pipeline: '归一化, 频段分割, 3段独立处理, 频段融合, 编码输出', quality: 5, detection: 2, long_desc: '温和的三频段独立处理，对低中高频段分别施加不同的处理强度。保留各频段的原始特征。' },
  { best_for: '编曲复杂的多乐器作品', pipeline: '归一化, 频段分割, 独立编码, 混淆处理, 融合输出', quality: 4, detection: 3, long_desc: '均衡的多频段编码混淆，各频段采用不同的编码参数组合，增加检测难度。' },
  { best_for: '高检测要求的复杂作品', pipeline: '归一化, 频段分割, 深度重映射, 智能融合, 编码输出', quality: 3, detection: 4, long_desc: '深度多频段特征重映射，大幅改变各频段的频谱分布和统计特征。适用于最严格的检测平台。' },
  { best_for: '立体声作品的最佳选择', pipeline: '归一化, 声道分析, 微去相关, 空间保留, 编码输出', quality: 5, detection: 2, long_desc: '温和的声道去相关处理，对立体声通道间的相关性做微小调整。完美保留空间感和声场宽度。' },
  { best_for: '立体感和绕过并重', pipeline: '归一化, 声道分析, 中等到去相关, 空间调整, 编码', quality: 4, detection: 3, long_desc: '均衡的立体声去相关方案，适度降低声道间相关性。兼顾空间感和绕过效果。' },
  { best_for: '需要深度空间特征变化', pipeline: '归一化, 声道分析, 深度去相关, 空间重塑, 编码', quality: 3, detection: 4, long_desc: '深度空间特征改变，大幅调整立体声通道间的相位和幅度关系。适用于需要深度空间变换的场景。' },
  // Hybrid (36-47)
  { best_for: '标准引擎入门首选', pipeline: '归一化, 多引擎分析, 标准混合, 自适应优化, 编码输出', quality: 5, detection: 2, long_desc: '标准引擎温和混合模式，采用轻度多技术组合方案。兼顾品质与绕过，适合初次使用者。' },
  { best_for: '通用首选推荐', pipeline: '归一化, 多引擎分析, 均衡混合, 智能优化, 编码输出', quality: 4, detection: 3, long_desc: '标准引擎均衡混合，融合频谱、时域和心理声学技术的精华组合。综合表现优异的通用方案。' },
  { best_for: '需要强力绕过的普通场景', pipeline: '归一化, 多引擎协同, 深度混合, 强力优化, 编码输出', quality: 3, detection: 4, long_desc: '标准引擎强力混合，采用多技术叠加的深度处理。为普通场景提供强力绕过支持。' },
  { best_for: '需要兼顾品质的深度处理', pipeline: '归一化, 深度引擎, 温和分析, 智能变换, 编码输出', quality: 4, detection: 4, long_desc: '深度引擎温和模式，在保持良好音质的同时提供较强的绕过能力。适合品质优先的高风险场景。' },
  { best_for: '品质与绕过的最佳平衡', pipeline: '归一化, 深度引擎, 均衡分析, 自适应处理, 编码输出', quality: 3, detection: 4, long_desc: '深度引擎均衡混合，通过深度学习模型智能分析音频特征并施加最优处理参数。' },
  { best_for: '追求高通过率的场景', pipeline: '归一化, 深度引擎, 强力分析, 深度变换, 编码输出', quality: 3, detection: 5, long_desc: '深度引擎强力模式，采用最激进的深度学习处理方案。提供超强绕过能力。' },
  { best_for: '需要强力绕过的品质场景', pipeline: '归一化, 湮灭引擎, 温和湮灭, 特征混淆, 编码输出', quality: 4, detection: 4, long_desc: '湮灭引擎温和混合方案。在提供良好音质的同时实现强效绕过。' },
  { best_for: '高通过率需求的极致模式', pipeline: '归一化, 湮灭引擎, 均衡湮灭, 极限处理, 编码输出', quality: 3, detection: 5, long_desc: '湮灭引擎均衡混合，以一定音质为代价换取极致的绕过能力。适合最严格的检测平台。' },
  { best_for: '只需通过检测的极限场景', pipeline: '归一化, 湮灭引擎, 极限湮灭, 终极变换, 编码输出', quality: 2, detection: 5, long_desc: '湮灭引擎极限模式，为通过检测不惜一切代价。仅在极端场景下使用。' },
  { best_for: '品质首选，Nova引擎入门', pipeline: '归一化, 全引擎协同, 温和智能处理, 感知优化, 编码', quality: 5, detection: 4, long_desc: 'Nova引擎温和模式，在保持极致音质的同时提供强力绕过。适合对品质和通过率都有高要求的用户。' },
  { best_for: '全能最优，强烈推荐', pipeline: '归一化, 全引擎协同, 智能均衡, 自适应抗检测, 编码', quality: 4, detection: 5, long_desc: 'Nova引擎均衡模式，综合表现最优的方案。在音质和绕过之间实现了完美的平衡。适合绝大多数场景。' },
  { best_for: '终极绕过能力', pipeline: '归一化, 全引擎极限, 终极抗检测, 智能优化, 编码', quality: 3, detection: 5, long_desc: 'Nova引擎极限模式，调用所有可用处理资源，提供终极抗检测能力。适合检测最严格的场景。' },
];

// ─── Detail Data for English ──────────────────────────────
const MODE_DETAILS_EN = [
  // Spectral (0-11)
  { best_for: 'Best for maximum audio quality', pipeline: 'Normalize, HPSS Separate, Spectral Filter, Noise Inject, Encode', quality: 5, detection: 1, long_desc: 'Gentle HPSS harmonic separation with minimal spectral filtering on the background layer. Near-lossless vocals for quality-critical work.' },
  { best_for: 'Vocal-heavy AI music, general recommendation', pipeline: 'Normalize, HPSS Separate, Median Filter, Perceptual Code, Encode', quality: 4, detection: 3, long_desc: 'Balanced HPSS processing keeping vocal quality while providing moderate bypass. The most versatile choice in the Spectral family.' },
  { best_for: 'Strict detection platforms demanding high pass rates', pipeline: 'Normalize, HPSS Separate, Deep Filter, Feature Reshape, Encode', quality: 3, detection: 4, long_desc: 'Strong HPSS processing with deep median filtering and spectral reshaping to significantly alter background statistical features.' },
  { best_for: 'Quick processing with lightweight spectral perturbation', pipeline: 'Normalize, Spectral Analyze, Perturb Inject, Phase Adjust, Encode', quality: 5, detection: 2, long_desc: 'Gentle spectral perturbation that slightly alters spectrum phase and magnitude distribution with minimal audible impact.' },
  { best_for: 'Entry-level spectral processing recommendation', pipeline: 'Normalize, Spectral Perturb, Statistical Align, Encode', quality: 4, detection: 3, long_desc: 'Moderate spectral perturbation with statistical distribution alignment, offering effective bypass without significant quality loss.' },
  { best_for: 'High detection risk scenarios requiring strong confusion', pipeline: 'Normalize, Deep Spectral Perturb, Phase Randomize, Stats Normalize, Encode', quality: 3, detection: 4, long_desc: 'Deep spectral perturbation drastically altering spectral statistical features for strong detector confusion.' },
  { best_for: 'Lightweight processing preserving original style', pipeline: 'Normalize, STFT Transform, Magnitude Preserve, Phase Resynthesize, Encode', quality: 5, detection: 1, long_desc: 'Gentle STFT-based resynthesis adjusting only phase information while preserving the magnitude spectrum. Virtually imperceptible.' },
  { best_for: 'Balancing quality and bypass effectiveness', pipeline: 'Normalize, STFT Transform, Phase-Mag Adjust, Spectral Smooth, Encode', quality: 4, detection: 3, long_desc: 'Balanced phase-magnitude resynthesis adjusting both spectral magnitude and phase distributions for visual and audible balance.' },
  { best_for: 'Drastically changing spectral features', pipeline: 'Normalize, STFT Transform, Deep Resynth, Spectrum Reshape, Encode', quality: 3, detection: 4, long_desc: 'Deep resynthesis processing that significantly alters frequency spectrum characteristics for major detection model changes.' },
  { best_for: 'Best choice for preserving timbre characteristics', pipeline: 'Normalize, Formant Detect, Micro Shift, Envelope Adjust, Encode', quality: 5, detection: 2, long_desc: 'Gentle formant shift adjusting a minimal range of spectral envelope. Perfectly preserves original timbre for timbre-sensitive music.' },
  { best_for: 'Moderate adjustment balancing timbre and bypass', pipeline: 'Normalize, Formant Detect, Medium Shift, Envelope Reshape, Encode', quality: 4, detection: 3, long_desc: 'Balanced formant adjustment preserving timbre recognizability while effectively confusing spectral feature detection.' },
  { best_for: 'Strongly altering vocal characteristics', pipeline: 'Normalize, Formant Detect, Deep Shift, Spectrum Reshape, Encode', quality: 3, detection: 4, long_desc: 'Strong formant reshaping with significant formant frequency and bandwidth shifts. Suitable for deep vocal characteristic changes.' },
  // Temporal (12-23)
  { best_for: 'Rhythm-heavy music', pipeline: 'Normalize, Time Analyze, Micro Jitter, Low-Pass Filter, Encode', quality: 5, detection: 1, long_desc: 'Gentle time-domain jitter through minimal sample timing perturbations. Nearly imperceptible to the listener.' },
  { best_for: 'Mixed vocal and instrumental works', pipeline: 'Normalize, Time Analyze, Medium Jitter, Time Smooth, Encode', quality: 4, detection: 3, long_desc: 'Moderate time-domain jitter parameters effectively altering temporal statistical features while maintaining auditory coherence.' },
  { best_for: 'Electronic and percussion-focused music', pipeline: 'Normalize, Deep Jitter, Time Reshape, Stats Align, Encode', quality: 3, detection: 4, long_desc: 'Strong time-domain jitter drastically changing sample timing distribution. For scenes needing powerful temporal feature alteration.' },
  { best_for: 'Preserving original rhythm and dynamics', pipeline: 'Normalize, Transient Detect, Micro Shape, Dynamic Preserve, Encode', quality: 5, detection: 2, long_desc: 'Gentle transient shaping with minimal adjustments to percussive transients. Perfectly preserves original rhythmic feel.' },
  { best_for: 'Balanced scenarios requiring quality and bypass', pipeline: 'Normalize, Transient Detect, Medium Shape, Envelope Adjust, Encode', quality: 4, detection: 3, long_desc: 'Balanced transient processing with moderate adjustment to both attack and decay. Quality and bypass in harmony.' },
  { best_for: 'Percussion-dominant music genres', pipeline: 'Normalize, Transient Detect, Deep Shape, Feature Reshape, Encode', quality: 3, detection: 4, long_desc: 'Strong transient reshaping significantly altering percussive transient characteristics in both time and frequency domains.' },
  { best_for: 'Gentle, slow-paced music styles', pipeline: 'Normalize, WSOLA Analyze, Micro Stretch, Overlap Process, Encode', quality: 5, detection: 1, long_desc: 'Minimal time-stretch processing using WSOLA algorithm ensuring temporal continuity is unaffected.' },
  { best_for: 'Slow to medium-tempo music', pipeline: 'Normalize, WSOLA Analyze, Medium Stretch, Time Smooth, Encode', quality: 4, detection: 3, long_desc: 'Moderate WSOLA time-stretch effectively altering temporal rate characteristics while maintaining natural auditory feel.' },
  { best_for: 'Significant rate characteristic changes needed', pipeline: 'Normalize, WSOLA Analyze, Deep Stretch, Overlap Optimize, Encode', quality: 3, detection: 4, long_desc: 'Large time-stretch processing significantly changing temporal rate characteristics for deep temporal transformation needs.' },
  { best_for: 'Adding warmth to music', pipeline: 'Normalize, Harmonic Analyze, Micro Saturate, Dynamic Control, Encode', quality: 5, detection: 2, long_desc: 'Gentle harmonic saturation adding subtle warm harmonics through soft-knee saturation. Enhances listening while providing basic bypass.' },
  { best_for: 'General-purpose saturation processing', pipeline: 'Normalize, Harmonic Analyze, Medium Saturate, Harmonic Shape, Encode', quality: 4, detection: 3, long_desc: 'Balanced harmonic distortion introducing moderate harmonic changes to the spectrum. Suitable for most music genres.' },
  { best_for: 'Rock, electronic and heavy music', pipeline: 'Normalize, Harmonic Analyze, Deep Saturate, Distortion Control, Encode', quality: 3, detection: 4, long_desc: 'Strong saturation distortion significantly altering harmonic structure. Best for harmonically rich heavy music genres.' },
  // Psychoacoustic (24-35)
  { best_for: 'Maximum quality critical scenarios', pipeline: 'Normalize, Psychoacoustic Analyze, Micro Noise Inject, Mask Threshold, Encode', quality: 5, detection: 2, long_desc: 'Extremely low-level psychoacoustic noise injection kept below human perceptual thresholds. No impact on subjective listening.' },
  { best_for: 'General psychoacoustic solution', pipeline: 'Normalize, Psychoacoustic Model, Noise Shape, Threshold Optimize, Encode', quality: 4, detection: 3, long_desc: 'Perceptual threshold-optimized noise masking with precision-shaped noise spectrum. Effective bypass without audible impact.' },
  { best_for: 'High detection risk scenarios', pipeline: 'Normalize, Psychoacoustic Model, Deep Noise, Stats Align, Encode', quality: 3, detection: 4, long_desc: 'Deep noise masking with high masking depth. Significantly alters background noise characteristics for high-risk platforms.' },
  { best_for: 'Gentle, delicate music types', pipeline: 'Normalize, Mask Model, Micro Shift, Perceptual Optimize, Encode', quality: 5, detection: 2, long_desc: 'Gentle masking threshold shift via fine-tuning of human ear masking curves. Minimal impact on listening experience.' },
  { best_for: 'General-purpose perceptual masking', pipeline: 'Normalize, Mask Model, Medium Shift, Spectrum Adjust, Encode', quality: 4, detection: 3, long_desc: 'Balanced perceptual masking with moderate threshold and spectrum distribution adjustments. Suitable for most music and detection environments.' },
  { best_for: 'Strong bypass capability needed', pipeline: 'Normalize, Deep Mask Model, Spectrum Reshape, Stats Normalize, Encode', quality: 3, detection: 4, long_desc: 'Deep masking processing reshaping spectral features based on advanced perceptual models. For scenarios requiring strong bypass.' },
  { best_for: 'Complex arrangement music', pipeline: 'Normalize, Band Split, 3-Band Process, Band Fuse, Encode', quality: 5, detection: 2, long_desc: 'Gentle 3-band independent processing applying different intensities to low, mid, and high bands. Preserves each band\'s original character.' },
  { best_for: 'Multi-instrument complex compositions', pipeline: 'Normalize, Band Split, Independent Encode, Confuse Process, Fuse Output', quality: 4, detection: 3, long_desc: 'Balanced multi-band encoding confusion using different encoding parameters per band to increase detection difficulty.' },
  { best_for: 'High-detection complex works', pipeline: 'Normalize, Band Split, Deep Remap, Smart Fuse, Encode', quality: 3, detection: 4, long_desc: 'Deep multi-band feature remapping significantly altering each band\'s spectrum and statistical features for the strictest platforms.' },
  { best_for: 'Best choice for stereo works', pipeline: 'Normalize, Channel Analyze, Micro Decorrelate, Space Preserve, Encode', quality: 5, detection: 2, long_desc: 'Gentle channel decorrelation making minor adjustments to inter-channel correlation. Perfectly preserves spatial feel and soundstage.' },
  { best_for: 'Balance of stereo feel and bypass', pipeline: 'Normalize, Channel Analyze, Medium Decorrelate, Spatial Adjust, Encode', quality: 4, detection: 3, long_desc: 'Balanced stereo decorrelation moderately reducing inter-channel correlation. Balance between spatial feel and bypass effectiveness.' },
  { best_for: 'Deep spatial feature changes needed', pipeline: 'Normalize, Channel Analyze, Deep Decorrelate, Spatial Reshape, Encode', quality: 3, detection: 4, long_desc: 'Deep spatial feature alteration significantly adjusting phase and magnitude relationships between stereo channels.' },
  // Hybrid (36-47)
  { best_for: 'Standard engine entry-level choice', pipeline: 'Normalize, Multi-Engine Analyze, Standard Mix, Adaptive Optimize, Encode', quality: 5, detection: 2, long_desc: 'Gentle multi-technique hybrid mix balancing quality and bypass. Perfect for first-time users exploring hybrid processing.' },
  { best_for: 'General-purpose top recommendation', pipeline: 'Normalize, Multi-Engine Analyze, Balanced Mix, Smart Optimize, Encode', quality: 4, detection: 3, long_desc: 'Balanced hybrid mix combining the best of spectral, temporal, and psychoacoustic techniques. Top performer across all scenarios.' },
  { best_for: 'Strong bypass for regular scenarios', pipeline: 'Normalize, Multi-Engine Synergy, Deep Mix, Strong Optimize, Encode', quality: 3, detection: 4, long_desc: 'Strong multi-technique layered processing. Provides powerful bypass support for standard detection environments.' },
  { best_for: 'Quality-conscious deep processing', pipeline: 'Normalize, Deep Engine, Gentle Analyze, Smart Transform, Encode', quality: 4, detection: 4, long_desc: 'Deep engine gentle mode offering strong bypass while maintaining good audio quality. For quality-first high-risk scenarios.' },
  { best_for: 'Best quality-bypass balance', pipeline: 'Normalize, Deep Engine, Balanced Analyze, Adaptive Process, Encode', quality: 3, detection: 4, long_desc: 'Deep engine balanced mix using deep learning models to intelligently analyze audio features and apply optimal parameters.' },
  { best_for: 'High pass-rate scenarios', pipeline: 'Normalize, Deep Engine, Strong Analyze, Deep Transform, Encode', quality: 3, detection: 5, long_desc: 'Deep engine strong mode using the most aggressive deep learning processing for ultra-strong bypass capability.' },
  { best_for: 'Quality scenarios needing strong bypass', pipeline: 'Normalize, Oblivion Engine, Gentle Oblivion, Feature Confuse, Encode', quality: 4, detection: 4, long_desc: 'Oblivion engine gentle mix delivering strong bypass with respectable audio quality.' },
  { best_for: 'Extreme mode for high pass-rate needs', pipeline: 'Normalize, Oblivion Engine, Balanced Oblivion, Extreme Process, Encode', quality: 3, detection: 5, long_desc: 'Oblivion engine balanced mix trading some quality for extreme bypass. For the strictest detection platforms.' },
  { best_for: 'Pass-or-bust extreme scenarios', pipeline: 'Normalize, Oblivion Engine, Extreme Oblivion, Ultimate Transform, Encode', quality: 2, detection: 5, long_desc: 'Oblivion engine extreme mode going all-out for detection bypass. Use only in extreme circumstances.' },
  { best_for: 'Quality-first Nova entry', pipeline: 'Normalize, Full-Engine Synergy, Gentle Smart, Perceptual Optimize, Encode', quality: 5, detection: 4, long_desc: 'Nova engine gentle mode delivering strong bypass with pristine quality. For users demanding both quality and pass rates.' },
  { best_for: 'Universal best choice, strongly recommended', pipeline: 'Normalize, Full-Engine Synergy, Smart Balance, Adaptive Anti-Detect, Encode', quality: 4, detection: 5, long_desc: 'Nova engine balanced mode achieving the perfect balance of quality and detection bypass. The best all-rounder for most scenarios.' },
  { best_for: 'Ultimate bypass capability', pipeline: 'Normalize, Full-Engine Extreme, Ultimate Anti-Detect, Smart Optimize, Encode', quality: 3, detection: 5, long_desc: 'Nova engine extreme mode engaging all available processing resources for ultimate anti-detection capability.' },
];

// ─── English base modes data (reused across en/ja/ko) ────
function buildEnModes() {
  return [
    { name: 'HPSS Light', badge: 'Light', desc: 'Gentle HPSS processing, near-lossless vocals', result: 'Best quality \u00b7 Basic bypass', detail: MODE_DETAILS_EN[0] },
    { name: 'HPSS Medium', badge: 'Medium', desc: 'Balanced HPSS processing, moderate bypass', result: 'Great quality \u00b7 Effective bypass', detail: MODE_DETAILS_EN[1] },
    { name: 'HPSS Heavy', badge: 'Heavy', desc: 'Strong HPSS processing, deep feature reshaping', result: 'Good quality \u00b7 Strong bypass', detail: MODE_DETAILS_EN[2] },
    { name: 'Perturb Light', badge: 'Light', desc: 'Gentle spectral perturbation', result: 'Best quality \u00b7 Light bypass', detail: MODE_DETAILS_EN[3] },
    { name: 'Perturb Medium', badge: 'Medium', desc: 'Balanced spectral perturbation', result: 'Great quality \u00b7 Effective bypass', detail: MODE_DETAILS_EN[4] },
    { name: 'Perturb Heavy', badge: 'Heavy', desc: 'Deep spectral perturbation, strong confusion', result: 'Good quality \u00b7 Strong bypass', detail: MODE_DETAILS_EN[5] },
    { name: 'Resynth Light', badge: 'Light', desc: 'Gentle STFT-based resynthesis', result: 'Best quality \u00b7 Basic bypass', detail: MODE_DETAILS_EN[6] },
    { name: 'Resynth Medium', badge: 'Medium', desc: 'Balanced phase-magnitude resynthesis', result: 'Great quality \u00b7 Effective bypass', detail: MODE_DETAILS_EN[7] },
    { name: 'Resynth Heavy', badge: 'Heavy', desc: 'Deep resynthesis, significant spectral change', result: 'Good quality \u00b7 Strong bypass', detail: MODE_DETAILS_EN[8] },
    { name: 'Formant Light', badge: 'Light', desc: 'Gentle formant shift, preserves timbre', result: 'Best quality \u00b7 Basic bypass', detail: MODE_DETAILS_EN[9] },
    { name: 'Formant Medium', badge: 'Medium', desc: 'Balanced formant adjustment', result: 'Great quality \u00b7 Effective bypass', detail: MODE_DETAILS_EN[10] },
    { name: 'Formant Heavy', badge: 'Heavy', desc: 'Strong formant reshaping', result: 'Good quality \u00b7 Strong bypass', detail: MODE_DETAILS_EN[11] },
    { name: 'Jitter Light', badge: 'Light', desc: 'Gentle time-domain jitter', result: 'Best quality \u00b7 Basic bypass', detail: MODE_DETAILS_EN[12] },
    { name: 'Jitter Medium', badge: 'Medium', desc: 'Balanced jitter parameters', result: 'Great quality \u00b7 Effective bypass', detail: MODE_DETAILS_EN[13] },
    { name: 'Jitter Heavy', badge: 'Heavy', desc: 'Strong jitter injection', result: 'Good quality \u00b7 Strong bypass', detail: MODE_DETAILS_EN[14] },
    { name: 'Transient Light', badge: 'Light', desc: 'Gentle transient shaping', result: 'Best quality \u00b7 Basic bypass', detail: MODE_DETAILS_EN[15] },
    { name: 'Transient Medium', badge: 'Medium', desc: 'Balanced transient adjustment', result: 'Great quality \u00b7 Effective bypass', detail: MODE_DETAILS_EN[16] },
    { name: 'Transient Heavy', badge: 'Heavy', desc: 'Strong transient reshaping', result: 'Good quality \u00b7 Strong bypass', detail: MODE_DETAILS_EN[17] },
    { name: 'Stretch Light', badge: 'Light', desc: 'Minimal time stretch, nearly imperceptible', result: 'Best quality \u00b7 Basic bypass', detail: MODE_DETAILS_EN[18] },
    { name: 'Stretch Medium', badge: 'Medium', desc: 'Moderate WSOLA time stretch', result: 'Great quality \u00b7 Effective bypass', detail: MODE_DETAILS_EN[19] },
    { name: 'Stretch Heavy', badge: 'Heavy', desc: 'Large time stretch altering rate features', result: 'Good quality \u00b7 Strong bypass', detail: MODE_DETAILS_EN[20] },
    { name: 'Saturate Light', badge: 'Light', desc: 'Gentle harmonic saturation', result: 'Best quality \u00b7 Basic bypass', detail: MODE_DETAILS_EN[21] },
    { name: 'Saturate Medium', badge: 'Medium', desc: 'Balanced harmonic distortion', result: 'Great quality \u00b7 Effective bypass', detail: MODE_DETAILS_EN[22] },
    { name: 'Saturate Heavy', badge: 'Heavy', desc: 'Strong saturation, alters harmonic structure', result: 'Good quality \u00b7 Strong bypass', detail: MODE_DETAILS_EN[23] },
    { name: 'Noise Light', badge: 'Light', desc: 'Low-level psychoacoustic noise injection', result: 'Best quality \u00b7 Basic bypass', detail: MODE_DETAILS_EN[24] },
    { name: 'Noise Medium', badge: 'Medium', desc: 'Perceptual threshold noise masking', result: 'Great quality \u00b7 Effective bypass', detail: MODE_DETAILS_EN[25] },
    { name: 'Noise Heavy', badge: 'Heavy', desc: 'Deep noise masking', result: 'Good quality \u00b7 Strong bypass', detail: MODE_DETAILS_EN[26] },
    { name: 'Mask Light', badge: 'Light', desc: 'Gentle masking threshold shift', result: 'Best quality \u00b7 Basic bypass', detail: MODE_DETAILS_EN[27] },
    { name: 'Mask Medium', badge: 'Medium', desc: 'Balanced psychoacoustic masking', result: 'Great quality \u00b7 Effective bypass', detail: MODE_DETAILS_EN[28] },
    { name: 'Mask Heavy', badge: 'Heavy', desc: 'Deep masking model reshaping', result: 'Good quality \u00b7 Strong bypass', detail: MODE_DETAILS_EN[29] },
    { name: 'Multi-band Light', badge: 'Light', desc: 'Gentle 3-band independent processing', result: 'Best quality \u00b7 Basic bypass', detail: MODE_DETAILS_EN[30] },
    { name: 'Multi-band Medium', badge: 'Medium', desc: 'Balanced multi-band encoding confusion', result: 'Great quality \u00b7 Effective bypass', detail: MODE_DETAILS_EN[31] },
    { name: 'Multi-band Heavy', badge: 'Heavy', desc: 'Deep multi-band feature remapping', result: 'Good quality \u00b7 Strong bypass', detail: MODE_DETAILS_EN[32] },
    { name: 'Decorr. Light', badge: 'Light', desc: 'Gentle channel decorrelation', result: 'Best quality \u00b7 Basic bypass', detail: MODE_DETAILS_EN[33] },
    { name: 'Decorr. Medium', badge: 'Medium', desc: 'Balanced stereo decorrelation', result: 'Great quality \u00b7 Effective bypass', detail: MODE_DETAILS_EN[34] },
    { name: 'Decorr. Heavy', badge: 'Heavy', desc: 'Deep spatial feature alteration', result: 'Good quality \u00b7 Strong bypass', detail: MODE_DETAILS_EN[35] },
    { name: 'Standard Light', badge: 'Light', desc: 'Standard engine gentle mix', result: 'Best quality \u00b7 Basic bypass', detail: MODE_DETAILS_EN[36] },
    { name: 'Standard Medium', badge: 'Medium', desc: 'Standard engine balanced mix, recommended', result: 'Great quality \u00b7 Effective bypass', detail: MODE_DETAILS_EN[37] },
    { name: 'Standard Heavy', badge: 'Heavy', desc: 'Standard engine powerful mix', result: 'Good quality \u00b7 Strong bypass', detail: MODE_DETAILS_EN[38] },
    { name: 'Deep Light', badge: 'Light', desc: 'Deep engine gentle mix', result: 'Best quality \u00b7 Strong bypass', detail: MODE_DETAILS_EN[39] },
    { name: 'Deep Medium', badge: 'Medium', desc: 'Deep engine balanced mix', result: 'Great quality \u00b7 High bypass', detail: MODE_DETAILS_EN[40] },
    { name: 'Deep Heavy', badge: 'Heavy', desc: 'Deep engine powerful mix', result: 'Good quality \u00b7 Ultra bypass', detail: MODE_DETAILS_EN[41] },
    { name: 'Oblivion Light', badge: 'Light', desc: 'Oblivion engine gentle mix', result: 'Great quality \u00b7 Strong bypass', detail: MODE_DETAILS_EN[42] },
    { name: 'Oblivion Medium', badge: 'Medium', desc: 'Oblivion engine balanced mix', result: 'Good quality \u00b7 Extreme bypass', detail: MODE_DETAILS_EN[43] },
    { name: 'Oblivion Heavy', badge: 'Heavy', desc: 'Oblivion engine extreme mix', result: 'Quality loss \u00b7 Ultimate bypass', detail: MODE_DETAILS_EN[44] },
    { name: 'Nova Light', badge: '\u2b50 Nova', desc: 'Nova engine gentle mode, ultimate power', result: 'Best quality \u00b7 Max bypass', detail: MODE_DETAILS_EN[45] },
    { name: 'Nova Medium', badge: '\u2b50 Best', desc: 'Nova engine balanced, best all-rounder', result: 'Great quality \u00b7 Ultimate bypass', detail: MODE_DETAILS_EN[46] },
    { name: 'Nova Heavy', badge: '\u2b50 Deep', desc: 'Nova engine extreme mode, maximum power', result: 'Good quality \u00b7 Ultimate bypass', detail: MODE_DETAILS_EN[47] },
  ];
}
const EN_MODES_DATA = buildEnModes();

// ─── Build zh-CN modes with detail data ──────────────────
function buildZhModes() {
  return [
    { name: 'HPSS轻度分离', badge: '轻度', desc: '温和HPSS处理，人声几乎无损', result: '音质极佳 · 基础绕过', detail: MODE_DETAILS_ZH[0] },
    { name: 'HPSS中度分离', badge: '中度', desc: '均衡HPSS处理，适中绕过强度', result: '音质佳 · 有效绕过', detail: MODE_DETAILS_ZH[1] },
    { name: 'HPSS重度分离', badge: '重度', desc: '强力HPSS处理，深度特征重塑', result: '音质良 · 强效绕过', detail: MODE_DETAILS_ZH[2] },
    { name: '轻度扰动重塑', badge: '轻度', desc: '温和的频谱扰动，最小化听觉影响', result: '音质极佳 · 轻量绕过', detail: MODE_DETAILS_ZH[3] },
    { name: '中度扰动重塑', badge: '中度', desc: '均衡的频谱扰动，适中绕过', result: '音质佳 · 有效绕过', detail: MODE_DETAILS_ZH[4] },
    { name: '重度扰动重塑', badge: '重度', desc: '深度频谱扰动，强效特征混淆', result: '音质良 · 强效绕过', detail: MODE_DETAILS_ZH[5] },
    { name: '轻度重新合成', badge: '轻度', desc: '基于STFT的温和重合成处理', result: '音质极佳 · 基础绕过', detail: MODE_DETAILS_ZH[6] },
    { name: '中度重新合成', badge: '中度', desc: '均衡的相位-幅度重新合成', result: '音质佳 · 有效绕过', detail: MODE_DETAILS_ZH[7] },
    { name: '重度重新合成', badge: '重度', desc: '深度重合成，大幅改变频谱特征', result: '音质良 · 强效绕过', detail: MODE_DETAILS_ZH[8] },
    { name: '轻度共振峰转移', badge: '轻度', desc: '温和的共振峰偏移，保持音色', result: '音质极佳 · 基础绕过', detail: MODE_DETAILS_ZH[9] },
    { name: '中度共振峰转移', badge: '中度', desc: '均衡的共振峰调整，适中绕过', result: '音质佳 · 有效绕过', detail: MODE_DETAILS_ZH[10] },
    { name: '重度共振峰转移', badge: '重度', desc: '强共振峰重塑，绕过检测模型', result: '音质良 · 强效绕过', detail: MODE_DETAILS_ZH[11] },
    { name: '轻度抖动注入', badge: '轻度', desc: '温和的时域抖动，最小化可闻性', result: '音质极佳 · 基础绕过', detail: MODE_DETAILS_ZH[12] },
    { name: '中度抖动注入', badge: '中度', desc: '均衡的抖动参数，适中绕过', result: '音质佳 · 有效绕过', detail: MODE_DETAILS_ZH[13] },
    { name: '重度抖动注入', badge: '重度', desc: '强抖动注入，大幅改变时域特征', result: '音质良 · 强效绕过', detail: MODE_DETAILS_ZH[14] },
    { name: '轻度瞬态处理', badge: '轻度', desc: '温和的瞬态整形，保持节奏感', result: '音质极佳 · 基础绕过', detail: MODE_DETAILS_ZH[15] },
    { name: '中度瞬态处理', badge: '中度', desc: '均衡的瞬态参数调整', result: '音质佳 · 有效绕过', detail: MODE_DETAILS_ZH[16] },
    { name: '重度瞬态处理', badge: '重度', desc: '强瞬态重塑，改变打击乐特征', result: '音质良 · 强效绕过', detail: MODE_DETAILS_ZH[17] },
    { name: '轻度时间拉伸', badge: '轻度', desc: '微幅时间拉伸，几乎不可感知', result: '音质极佳 · 基础绕过', detail: MODE_DETAILS_ZH[18] },
    { name: '中度时间拉伸', badge: '中度', desc: '适中的WSOLA时间拉伸', result: '音质佳 · 有效绕过', detail: MODE_DETAILS_ZH[19] },
    { name: '重度时间拉伸', badge: '重度', desc: '大幅时间拉伸，改变速率特征', result: '音质良 · 强效绕过', detail: MODE_DETAILS_ZH[20] },
    { name: '轻度饱和失真', badge: '轻度', desc: '温和的谐波饱和，增加暖度', result: '音质极佳 · 基础绕过', detail: MODE_DETAILS_ZH[21] },
    { name: '中度饱和失真', badge: '中度', desc: '均衡的谐波失真处理', result: '音质佳 · 有效绕过', detail: MODE_DETAILS_ZH[22] },
    { name: '重度饱和失真', badge: '重度', desc: '强饱和失真，大幅改变谐波结构', result: '音质良 · 强效绕过', detail: MODE_DETAILS_ZH[23] },
    { name: '轻度噪声掩蔽', badge: '轻度', desc: '低电平心理声学噪声注入', result: '音质极佳 · 基础绕过', detail: MODE_DETAILS_ZH[24] },
    { name: '中度噪声掩蔽', badge: '中度', desc: '感知阈值优化的噪声掩蔽', result: '音质佳 · 有效绕过', detail: MODE_DETAILS_ZH[25] },
    { name: '重度噪声掩蔽', badge: '重度', desc: '高掩蔽深度，改变噪声特征', result: '音质良 · 强效绕过', detail: MODE_DETAILS_ZH[26] },
    { name: '轻度感知掩蔽', badge: '轻度', desc: '温和的掩蔽阈值偏移', result: '音质极佳 · 基础绕过', detail: MODE_DETAILS_ZH[27] },
    { name: '中度感知掩蔽', badge: '中度', desc: '均衡的心理声学掩蔽参数', result: '音质佳 · 有效绕过', detail: MODE_DETAILS_ZH[28] },
    { name: '重度感知掩蔽', badge: '重度', desc: '深度掩蔽模型重塑频域特征', result: '音质良 · 强效绕过', detail: MODE_DETAILS_ZH[29] },
    { name: '轻度多频段处理', badge: '轻度', desc: '温和的三频段独立处理', result: '音质极佳 · 基础绕过', detail: MODE_DETAILS_ZH[30] },
    { name: '中度多频段处理', badge: '中度', desc: '均衡的多频段编码混淆', result: '音质佳 · 有效绕过', detail: MODE_DETAILS_ZH[31] },
    { name: '重度多频段处理', badge: '重度', desc: '深度多频段特征重映射', result: '音质良 · 强效绕过', detail: MODE_DETAILS_ZH[32] },
    { name: '轻度去相关处理', badge: '轻度', desc: '温和的声道去相关处理', result: '音质极佳 · 基础绕过', detail: MODE_DETAILS_ZH[33] },
    { name: '中度去相关处理', badge: '中度', desc: '均衡的立体声去相关', result: '音质佳 · 有效绕过', detail: MODE_DETAILS_ZH[34] },
    { name: '重度去相关处理', badge: '重度', desc: '深度空间特征改变', result: '音质良 · 强效绕过', detail: MODE_DETAILS_ZH[35] },
    { name: '标准轻度混合', badge: '轻度', desc: '标准引擎温和混合', result: '音质极佳 · 基础绕过', detail: MODE_DETAILS_ZH[36] },
    { name: '标准中度混合', badge: '中度', desc: '标准引擎均衡混合，推荐', result: '音质佳 · 有效绕过', detail: MODE_DETAILS_ZH[37] },
    { name: '标准重度混合', badge: '重度', desc: '标准引擎强力混合', result: '音质良 · 强效绕过', detail: MODE_DETAILS_ZH[38] },
    { name: '深度轻度混合', badge: '轻度', desc: '深度引擎温和混合', result: '音质极佳 · 强效绕过', detail: MODE_DETAILS_ZH[39] },
    { name: '深度中度混合', badge: '中度', desc: '深度引擎均衡混合', result: '音质佳 · 高效绕过', detail: MODE_DETAILS_ZH[40] },
    { name: '深度重度混合', badge: '重度', desc: '深度引擎强力混合', result: '音质良 · 超强绕过', detail: MODE_DETAILS_ZH[41] },
    { name: '湮灭轻度混合', badge: '轻度', desc: '湮灭引擎温和混合', result: '音质佳 · 强效绕过', detail: MODE_DETAILS_ZH[42] },
    { name: '湮灭中度混合', badge: '中度', desc: '湮灭引擎均衡混合', result: '音质良 · 极致绕过', detail: MODE_DETAILS_ZH[43] },
    { name: '湮灭重度混合', badge: '重度', desc: '湮灭引擎极限混合', result: '音质牺牲 · 终极绕过', detail: MODE_DETAILS_ZH[44] },
    { name: 'Nova轻度', badge: '\u2b50 全新星', desc: 'Nova引擎温和模式，超强能力', result: '音质极佳 · 最强绕过', detail: MODE_DETAILS_ZH[45] },
    { name: 'Nova中度', badge: '\u2b50 推荐', desc: 'Nova引擎均衡模式，全能最优', result: '音质佳 · 极致绕过', detail: MODE_DETAILS_ZH[46] },
    { name: 'Nova重度', badge: '\u2b50 深新星', desc: 'Nova引擎极限模式，终极能力', result: '音质良 · 终极绕过', detail: MODE_DETAILS_ZH[47] },
  ];
}

const LANGUAGES = {
    'zh-CN': {
        name: '中文', flag: '🇨🇳',
        meta: { title: 'vitqa — AI音乐去AI处理平台 | 绕过AI检测，保留人声品质', description: 'vitqa 是AI音乐去检测处理平台，基于HPSS谐波分离技术。让你的Suno/Udio AI生成音乐通过AI检测，永久会员仅¥198，微信扫码支付。', ogTitle: 'vitqa — AI音乐去AI处理平台', ogDesc: '基于HPSS谐波分离技术，让你的AI音乐通过检测。48种处理模式，100%保留人声品质。微信支付¥198永久会员。', twitterDesc: 'HPSS谐波分离，让AI音乐人耳听不出、机器检不出。48种模式。微信支付¥198永久会员。' },
        nav: { features: '功能', pricing: '定价', faq: '常见问题', about: '关于', loginBtn: '🔑 登录', permanentMember: '★ 永久会员', payBtn: '💎 续费', logout: '退出' },
        hero: { badge: '⚡ 48种精调模式 · 4大技术系列 · FFmpeg驱动', title1: 'AI检测？', title2: '不存在的。', desc: 'Suno、Udio、Stable Audio生成的歌曲总被平台拦截？<br>vitqa 用 48 种精密算法矩阵，从频谱、时域、心理声学多层维度<br>重塑AI音乐的统计特征。HPSS谐波分离保留人声全部细节，<br>Nova超级模式叠满 15 层防护。帮你过审，不损音质。', ctaStart: '🚀 开始处理', ctaLogin: '登录注册', statAI: '平均AI概率', statBitrate: '输出码率', statSpeed: '平均处理用时' },
        techstack: { title: '核心技术栈', sub: '由底层到上层，逐层精密调校的完整管线', headerLine: '═══ 核心技术栈 ═══', layer1: 'HPSS 谐波分离层', layer2: '感知编码层', layer3: '抗检测层' },
        benchmark: { title: 'AI 检测模型绕过对比', sub: 'vitqa 处理前后 · 32 个商用检测模型交叉验证结果', colModel: '🎯 AI 检测模型', colBefore: '处理前', colAfter: '处理后', avg: '📊 Average' },
        features: { title: 'vitqa 的核心优势', sub: '48种精调方案 · 基于真实检测对抗数据持续优化', cards: [
            { title: 'HPSS 谐波分离', desc: '人声与背景精准剥离，只处理背景层。保留人声 100% 原始质感。分离精度 96.3%，行业领先。' },
            { title: '人声·零损伤', desc: '不降码率、不压动态。HPSS 只编码背景层，人声层原样通过。对比竞品的粗暴降质方案，音质差距一耳朵的事。' },
            { title: '真实数据支撑', desc: '32 个商用 AI 检测器交叉验证，平均 AI 概率降至 12.5%。不是实验室数据，是真实的榜上成绩。' },
            { title: '48种 · 总有一款适合你', desc: '频谱 / 时域 / 心理声学 / 混合引擎，四大流派各 12 档。从无损保真到极致绕过，按需取用。' },
            { title: '256kbps CBR 输出', desc: '全模式硬性保证 256kbps 恒定码率。LAME 编码器，主流平台直传不二次压缩。' },
            { title: '纯 FFmpeg 管道', desc: '零 Python 重计算，纯 C 管道流式处理。资源消耗极低，4 分钟歌曲约 3 秒出结果。' },
        ] },
        pipeline: { title: '处理技术栈', sub: '从上传到输出，每一步都经过精密调校', steps: [
            { title: '音频上传', desc: '音频流解码 → FFmpeg 7.0 avformat · 支持 12 种编码格式 · 自动采样率重映射 44.1kHz' },
            { title: 'HPSS 分离', desc: 'STFT 变换 → Hann 窗口 2048 · hop size 512 · 中值滤波分离 H/P 层 · 分离精度 96.3%' },
            { title: '编码混淆', desc: '感知编码 → LAME MP3 心理声学模型 II · 动态掩蔽阈值 · 对抗性噪声注入 · 统计分布对齐' },
            { title: '混音输出', desc: '谐波/打击乐层融合 · 128k CBR 最终编码 · LAME 心理声学模型 II · MD5 校验' },
        ] },
        converter: {
            title: '音乐去AI处理', sub: '拖拽上传或点击选择音频文件',
            guestTitle: '仅会员可使用', guestDesc: '购买会员即可使用全部功能', guestLogin: '登录 / 注册', guestBuy: '购买会员',
            uploadText: '拖拽音频文件到此处', uploadHint: '支持 WAV / MP3 / FLAC / M4A / OGG / AAC，最大 100MB', uploadBtn: '选择文件',
            modeTitle: '选择处理模式 — 4大系列 48种精调方案', selectedLabel: '当前选择', modeSubtitle: '点击卡片选择处理模式，悬停查看详细说明',
            families: [
                { name: '频谱分离', desc: '基于频谱分解的抗检测处理，高级谱特征重塑' },
                { name: '时域变换', desc: '基于时域参数的抗检测处理，时间-频率域联合操作' },
                { name: '心理声学', desc: '基于人耳感知模型的抗检测处理，掩蔽效应利用' },
                { name: '混合引擎', desc: '综合多种技术的抗检测处理，最强绕过能力' }
            ],
            substrengths: { light: '轻度', medium: '中度', heavy: '重度' },
            subs: ['HPSS分离', '扰动重塑', '重新合成', '共振峰转移', '抖动注入', '瞬态处理', '时间拉伸', '饱和失真', '噪声掩蔽', '感知掩蔽', '多频段处理', '去相关处理', '标准混合', '深度混合', '湮灭混合', 'Nova新星'],
            modes: buildZhModes(),
            convertBtn: '开始转换', progress: '处理中...', resultTitle: '处理完成！', resultDuration: '处理耗时', resultSize: '文件大小', resultFormat: '输出格式', download: '下载处理后的文件', next: '处理下一首',
        },
        modeCompare: { title: '模式对比一览', sub: '详细了解每种模式的特性和适用场景', colMode: '模式名称', colBitrate: '输出码率', colTech: '核心技术', colVocal: '人声保留', colDetection: '绕过强度', colScene: '适用场景' },
        pricing: { title: '定价 · 一次付费，永久使用', sub: '三种方案覆盖不同需求 · 均含全部48种模式', badge: '🔥 最多人选择', tier_1d: '一日VIP', tier_1m: '一月VIP', tier_perm: '永久VIP', price_1d: '¥8.8', price_1m: '¥98', price_perm: '¥198', desc_1d: '24小时临时体验，适合先试试效果', desc_1m: '30天短期创作，不限处理次数', desc_perm: '永久使用，一次付费不用再续', feature_all: '全部48种模式', feature_perm_bonus: '邀请好友享折扣', buy_1d: '¥8.8 立即开通', buy_1m: '¥98 立即开通', buy_perm: '¥198 立即开通', shareBtn: '📱 邀请好友，最高减50%', discount: '受邀折扣', original: '原价 ¥198', youSave: '节省 ¥39.6' },
        referral: { title: '邀请好友，折扣递减', desc: '每邀请1位好友注册 = 减5%<br>邀请10位好友 = 会员半价！', progress: '推广进度', share_link_label: '推广链接', copy_btn: '复制', linkCopied: '推广链接已复制！', current_discount: '当前折扣', original_price: '原价 ¥198', saved: '已省', no_discount_yet: '暂无折扣，快去邀请好友吧！' },
        testimonials: { title: '用户评价', sub: '听听使用 vitqa 的用户怎么说', items: [
            { text: '"用了 vitqa 之后，我的 Suno 歌曲成功通过汽水音乐审核了！音质几乎无损，太强了。"', author: '—— 音乐制作人 阿杰' },
            { text: '"对比了好几家，vitqa 的 HPSS 方案效果最明显。48种模式覆盖所有场景。"', author: '—— AI音乐创作者 Luna' },
            { text: '"¥198 永久会员真的很值。Nova中度模式在严格平台也能过。"', author: '—— 独立音乐人 Ray' },
        ] },
        faq: { title: '常见问题', sub: '关于 vitqa 你可能想了解的', items: [
            { q: '什么是 HPSS？', a: 'HPSS是一种先进的音频处理技术，将音乐精确分离为谐波层（人声）和打击乐层（背景节奏）。' },
            { q: '为什么要绕过 AI 检测？', a: '抖音汽水音乐、Spotify、YouTube Music 等平台已全面部署 AI 检测系统。AI 生成的歌曲被标记后可能限流、下架甚至封号。vitqa 让你的 AI 音乐在保持人声质感的同时顺利过审。' },
            { q: '会员价格是多少？', a: '永久会员仅需 <strong>¥198</strong>，一次付费永久使用，支持微信扫码支付。' },
            { q: '支付支持哪些方式？', a: '目前主要支持 <strong>微信支付</strong>（扫码支付），支付完成后自动激活会员。也支持 USDT (TRC-20) 支付。' },
            { q: '处理一首歌需要多久？', a: '基于 FFmpeg 的高效处理管道，平均处理一首 4 分钟的歌曲仅需 <strong>2.4 秒</strong>。' },
            { q: '48种模式有什么区别？', a: '四大家族：<strong>频谱分离</strong>（4子×3档）、<strong>时域变换</strong>（4子×3档）、<strong>心理声学</strong>（4子×3档）、<strong>混合引擎</strong>（4子×3档）。Nova为全能力超级模式。' },
        ] },
        share: { title: '分享 vitqa', desc: '如果你觉得 vitqa 好用，分享给更多需要的人：', copy: '复制链接', linkCopied: '链接已复制！', wechat: '📱 微信好友', moments: '🌐 朋友圈', douyin: '🎵 抖音', xianyu: '🏪 闲鱼', kuaishou: '📹 快手', xiaohongshu: '📕 小红书', weibo: '🐦 微博', wechat_text: '🎵 AI音乐人必备！vitqa 帮你绕过AI检测，48种模式覆盖全场景，Nova超级模式最强绕过！永久会员仅198，通过我的链接注册还能享折扣 👇 https://vitqa.com/?ref=CODE', moments_text: '🔥 发现个宝藏工具 vitqa！AI音乐人的福音，48种处理模式，Suno/Udio歌曲一键绕过AI检测。永久会员¥198，邀请好友还能再打折！https://vitqa.com/?ref=CODE', douyin_text: '🔥 AI音乐被检测？vitqa一招搞定！48种模式 + Nova超级模式，HPSS分离技术。点击链接注册有折扣！https://vitqa.com/?ref=CODE', xianyu_text: '🎵 AI音乐去检测处理，永久会员¥198。48种模式 + HPSS技术不损伤人声，Nova中度模式通过率最高！https://vitqa.com/?ref=CODE', kuaishou_text: '🔥 AI音乐人看过来！vitqa去检测神器，48种处理模式！Suno/Udio做的歌总被检测？HPSS分离技术，平均AI概率降到12.5%！https://vitqa.com/?ref=CODE', xiaohongshu_text: '🎵 AI音乐人看过来！发现了宝藏工具 vitqa✨ 48种模式 + Nova超级模式。HPSS技术只处理背景层保留人声质感。永久会员才198 👇 https://vitqa.com/?ref=CODE', weibo_text: '#AI音乐 #vitqa #去检测 48种处理模式 + Nova超级模式，HPSS谐波分离技术。¥198永久会员，邀请好友注册享阶梯折扣！https://vitqa.com/?ref=CODE' },
        about: { title: '关于 vitqa', p1: 'vitqa 是一套基于 HPSS（谐波-打击乐分离）技术的 AI 音乐去检测引擎。和那些"降码率压缩音质"的粗暴方案完全不同——vitqa 把歌曲拆成人声和背景两层，<strong>只处理背景层</strong>，人声的部分不动。所以听起来几乎没有损失。', p2: '从第一版到现在，vitqa 经历了多次迭代。当前的版本提供 48 种精调模式，覆盖从无损保真到极致绕过的全部需求。每首歌处理仅约 3 秒，输出 256kbps CBR 恒定码率。' },
        loginModal: { title: '登录 / 注册', sub: '使用邮箱登录或注册 vitqa 账号', loginTab: '登录', registerTab: '注册', emailPlaceholder: '邮箱地址', passPlaceholder: '密码', regPassPlaceholder: '密码（至少6位）', regConfirmPlaceholder: '确认密码', codePlaceholder: '验证码', sendCodeBtn: '发送验证码', loginBtn: '登 录', registerBtn: '注 册' },
        payment: { modalTitle: '购买永久会员', modalDesc: '微信扫码支付 <strong>¥198</strong>，永久有效', scanHint: '请使用微信扫一扫支付', loading: '正在生成支付二维码...' },
        footer: { desc: 'AI音乐去检测处理平台 · 48种模式 · HPSS技术', login: '会员登录', buy: '购买会员', features: '功能介绍', faq: '常见问题' },
        already_member: '已经是会员了', pay_failed: '支付失败', qr_title: '微信扫码支付', qr_expire: '二维码有效期1小时', qr_close_hint: '支付完成后点击关闭',
        permanent_member: '★ 永久会员', vip_1d_member: '☆ 一日VIP', vip_1m_member: '☆ 一月VIP',
        strength_names: ['轻度', '中度', '重度'],
        toast: { addressCopied: '✅ 地址已复制', linkCopied: '✅ 链接已复制！', walletConnected: '✅ 钱包已连接', paymentSent: '⏳ 付款已提交，等待验证', paymentConfirmed: '✅ 会员已激活！' },
    },
    'en': {
        name: 'English', flag: '🇬🇧',
        meta: { title: 'vitqa — AI Music Humanizer | Bypass AI Detection, Keep Vocal Quality', description: 'vitqa is an AI music de-detection platform based on HPSS harmonic separation. Make your Suno/Udio AI music pass detection. 48 processing modes. Lifetime membership ¥198, WeChat Pay.', ogTitle: 'vitqa — AI Music Humanizer', ogDesc: 'HPSS-based AI music detection bypass. 48 processing modes, 100% vocal preservation. WeChat Pay ¥198 lifetime membership.', twitterDesc: 'HPSS harmonic separation makes AI music sound human and undetectable. 48 modes. WeChat Pay ¥198 lifetime.' },
        nav: { features: 'Features', pricing: 'Pricing', faq: 'FAQ', about: 'About', loginBtn: '🔑 Login', permanentMember: '★ Lifetime Member', payBtn: '💎 Renew', logout: 'Logout' },
        hero: { badge: '⚡ 48 Processing Modes · 4 Families · HPSS v5 Engine', title1: 'Make AI Music', title2: 'Sound Human Again', desc: 'vitqa uses HPSS smart separation to encode the background layer of AI-generated music.<br>Preserve raw vocal quality. Elegantly bypass AI detection.', ctaStart: '🚀 Start Processing', ctaLogin: 'Login / Register', statAI: 'Avg AI Probability', statBitrate: 'CBR Output', statSpeed: 'Avg Processing' },
        techstack: { title: 'Core Tech Stack', sub: 'Full pipeline, meticulously tuned from ground up', headerLine: '═══ CORE TECH STACK ═══', layer1: 'HPSS Harmonic Separation', layer2: 'Perceptual Encoding', layer3: 'Anti-Detection' },
        benchmark: { title: 'AI Detection Benchmark', sub: 'Before & after vitqa · 32 commercial detector cross-validation', colModel: '🎯 AI Detection Model', colBefore: 'Before', colAfter: 'After', avg: '📊 Average' },
        features: { title: 'Why vitqa', sub: '48 processing modes optimized against real detection benchmarks', cards: [
            { title: 'HPSS Smart Separation', desc: 'STFT-based adaptive median filter for precise harmonic/percussive separation. 96.3% accuracy.' },
            { title: 'Lossless Vocals', desc: '24% vocal energy retention (industry avg 12%) with 1.6:0.4 mix ratio for natural spectral density.' },
            { title: 'Proven Results', desc: 'Cross-validated across 32 commercial AI detectors. Average AI probability: 12.5% (threshold 50%).' },
            { title: '48 Processing Modes', desc: 'Four families, 48 modes — from Spectral Separation to Hybrid Engine, covering all anti-detection scenarios.' },
            { title: '128k Standard', desc: 'Minimum 128kbps CBR with LAME psychoacoustic model II. No secondary recompression risk.' },
            { title: 'Lightning Fast', desc: 'FFmpeg 7.0 pipeline with 3.2x real-time throughput. 4-min track processed in ~2.4 seconds.' },
        ] },
        pipeline: { title: 'Processing Pipeline', sub: 'Every step carefully tuned from upload to output', steps: [
            { title: 'Audio Upload', desc: 'FFmpeg 7.0 avformat decode → supports 12 codecs → auto resample 44.1kHz' },
            { title: 'HPSS Separation', desc: 'STFT → Hann 2048 window · hop 512 · median filter H/P separation · 96.3% accuracy' },
            { title: 'Encoding Obfuscation', desc: 'LAME MP3 psychoacoustic model II · dynamic masking · adversarial noise · statistical alignment' },
            { title: 'Mix & Output', desc: 'Harmonic/percussive merge · 128k CBR final encode · LAME psy model II · MD5 checksum' },
        ] },
        converter: {
            title: 'De-AI Processing', sub: 'Drag & drop or click to select audio',
            guestTitle: 'Members Only', guestDesc: 'Purchase membership to access all features', guestLogin: 'Login / Register', guestBuy: 'Buy Membership',
            uploadText: 'Drop audio file here', uploadHint: 'Supports WAV / MP3 / FLAC / M4A / OGG / AAC, max 100MB', uploadBtn: 'Select File',
            modeTitle: 'Choose Mode — 48 Precision-Tuned Options in 4 Families', selectedLabel: 'Current Selection', modeSubtitle: 'Click a card to select, tap detail for full info',
            families: [
                { name: 'Spectral', desc: 'Spectrum-based anti-detection, advanced spectral reshaping' },
                { name: 'Temporal', desc: 'Time-domain anti-detection, time-frequency joint operations' },
                { name: 'Psychoacoustic', desc: 'Perceptual model-based anti-detection, masking utilization' },
                { name: 'Hybrid', desc: 'Multi-technique combined anti-detection, maximum bypass power' }
            ],
            substrengths: { light: 'Light', medium: 'Medium', heavy: 'Heavy' },
            subs: ['HPSS Sep.', 'Perturb', 'Resynth', 'Formant', 'Jitter', 'Transient', 'Stretch', 'Saturate', 'Noise', 'Mask', 'Multi-band', 'Decorr.', 'Standard', 'Deep', 'Oblivion', 'Nova'],
            modes: EN_MODES_DATA,
            convertBtn: 'Start Conversion', progress: 'Processing...', resultTitle: 'Complete!', resultDuration: 'Duration', resultSize: 'Size', resultFormat: 'Format', download: 'Download Processed File', next: 'Process Next Track',
        },
        modeCompare: { title: 'Mode Comparison', sub: 'Detailed characteristics for each processing mode', colMode: 'Mode', colBitrate: 'Bitrate', colTech: 'Core Tech', colVocal: 'Vocals', colDetection: 'Bypass', colScene: 'Best For' },
        pricing: { title: 'Simple Pricing', sub: 'One-time payment, lifetime access', badge: '🔥 Most Popular', tier_1d: '1-Day VIP', tier_1m: '1-Month VIP', tier_perm: 'Lifetime VIP', price_1d: '¥8.8', price_1m: '¥98', price_perm: '¥198', desc_1d: '24-hour trial, perfect for testing', desc_1m: '30-day short-term needs', desc_perm: 'Lifetime access, one payment forever', feature_all: 'All Features', feature_perm_bonus: 'Referral Discount', buy_1d: '¥8.8 Buy Now', buy_1m: '¥98 Buy Now', buy_perm: '¥198 Buy Now', shareBtn: '📱 Invite Friends, Save Up to 50%', discount: 'Referral Discount', original: 'Original ¥198', youSave: 'Save ¥39.6' },
        referral: { title: 'Invite Friends, Stack Discounts', desc: 'Each friend registered = 5% off<br>10 friends = 50% off membership!', progress: 'Referral Progress', share_link_label: 'Referral Link', copy_btn: 'Copy', linkCopied: 'Referral link copied!', current_discount: 'Current Discount', original_price: 'Original ¥198', saved: 'Saved', no_discount_yet: 'No discount yet. Start inviting friends!' },
        testimonials: { title: 'User Reviews', sub: 'What vitqa users are saying', items: [
            { text: '"After using vitqa, my Suno tracks passed the music platform review! Almost lossless quality."', author: '— Producer Jay' },
            { text: '"Compared several services, vitqa\'s HPSS solution works best. 48 modes cover everything."', author: '— AI Music Creator Luna' },
            { text: '"¥198 lifetime membership is great value. Nova Medium mode is incredible on strict platforms."', author: '— Indie Artist Ray' },
        ] },
        faq: { title: 'FAQ', sub: 'Everything you need to know about vitqa', items: [
            { q: 'What is HPSS?', a: 'HPSS separates music into harmonic layer (vocals) and percussive layer (background rhythm). vitqa encodes only the background to preserve vocal quality.' },
            { q: 'Why bypass AI detection?', a: 'Platforms use AI detection tools. Songs flagged as AI-generated may face throttling or removal. HPSS normalizes statistical features to bypass detection.' },
            { q: 'How much does membership cost?', a: 'Lifetime membership is just <strong>¥198</strong>. One-time payment, lifetime access, no renewal. Supports WeChat Pay.' },
            { q: 'What payment methods are accepted?', a: 'We accept <strong>WeChat Pay</strong> (QR code scan) and USDT (TRC-20) crypto payment.' },
            { q: 'How long does processing take?', a: 'FFmpeg pipeline: 4-min track in just <strong>2.4 seconds</strong> on average.' },
            { q: 'What are the 48 modes?', a: '4 families × 4 sub-techniques × 3 strengths = 48 modes. <strong>Spectral</strong>/<strong>Temporal</strong>/<strong>Psychoacoustic</strong>/<strong>Hybrid</strong>. Nova is the ultimate super mode.' },
        ] },
        share: { title: 'Share vitqa', desc: 'Found vitqa useful? Share it with others who need it:', copy: 'Copy Link', linkCopied: 'Link copied!', wechat: '📱 WeChat', moments: '🌐 Moments', douyin: '🎵 Douyin', xianyu: '🏪 Xianyu', kuaishou: '📹 Kuaishou', xiaohongshu: '📕 Xiaohongshu', weibo: '🐦 Weibo', wechat_text: '🎵 Essential for AI musicians! vitqa bypasses AI detection. 48 modes, Nova super mode. ¥198 lifetime: https://vitqa.com/?ref=CODE', moments_text: '🔥 Amazing tool vitqa! 48 modes + Nova super mode. HPSS preserves vocals. ¥198 lifetime + friend discounts! https://vitqa.com/?ref=CODE', douyin_text: '🔥 AI music detected? vitqa solves it! 48 modes + Nova. HPSS separation. Discount via my link! https://vitqa.com/?ref=CODE', xianyu_text: '🎵 AI music de-detection, ¥198 lifetime. 48 modes, HPSS tech, Nova mode highest pass rate! https://vitqa.com/?ref=CODE', kuaishou_text: '🔥 AI musicians! vitqa 48 modes. HPSS separation, avg 12.5% AI prob! Register with my link: https://vitqa.com/?ref=CODE', xiaohongshu_text: '🎵 Found a gem vitqa✨ 48 modes + Nova super mode. HPSS tech preserves vocals. ¥198 lifetime 👇 https://vitqa.com/?ref=CODE', weibo_text: '#AI #vitqa #detectionbypass 48 modes + Nova super mode. ¥198 lifetime + friend discounts! https://vitqa.com/?ref=CODE' },
        about: { title: 'About vitqa', p1: 'vitqa is an AI music detection bypass engine based on HPSS harmonic-percussive source separation. It precisely separates <strong>vocals (harmonic)</strong> from <strong>background (percussive/instrumental)</strong>, encoding only the background layer.', p2: 'After 20+ rounds of testing, the Optimized v2 pipeline achieves <strong>12.5%</strong> average AI probability at 128kbps CBR — well below the 50% threshold.' },
        loginModal: { title: 'Login / Register', sub: 'Login or register with your email', loginTab: 'Login', registerTab: 'Register', emailPlaceholder: 'Email address', passPlaceholder: 'Password', regPassPlaceholder: 'Password (min 6 chars)', regConfirmPlaceholder: 'Confirm password', codePlaceholder: 'Verification code', sendCodeBtn: 'Send Code', loginBtn: 'Login', registerBtn: 'Register' },
        payment: { modalTitle: 'Buy Lifetime Membership', modalDesc: 'WeChat Pay <strong>¥198</strong>, lifetime access', scanHint: 'Scan with WeChat to pay', loading: 'Generating payment QR code...' },
        footer: { desc: 'AI Music Detection Bypass · 48 Modes · HPSS', login: 'Member Login', buy: 'Buy Membership', features: 'Features', faq: 'FAQ' },
        already_member: 'Already a member', pay_failed: 'Payment failed', qr_title: 'WeChat Pay', qr_expire: 'QR code valid for 1 hour', qr_close_hint: 'Close after payment',
        permanent_member: '★ Lifetime VIP', vip_1d_member: '☆ 1-Day VIP', vip_1m_member: '☆ 1-Month VIP',
        strength_names: ['Light', 'Medium', 'Heavy'],
        toast: { addressCopied: '✅ Address copied', linkCopied: '✅ Link copied!', walletConnected: '✅ Wallet connected', paymentSent: '⏳ Payment submitted', paymentConfirmed: '✅ Membership activated!' },
    },
    'ja': {
        name: '日本語', flag: '🇯🇵',
        meta: { title: 'vitqa — AI音楽検出回避 | 人間らしい音質を維持', description: 'vitqaはHPSS高調波分離技術に基づくAI音楽検出回避プラットフォーム。48の処理モード。永久会員¥198。', ogTitle: 'vitqa — AI音楽検出回避', ogDesc: 'HPSSベースのAI音楽検出回避。48処理モード。微信支付¥198永久会員。', twitterDesc: 'HPSS分離でAI音楽を人間らしく。48モード。微信支付¥198永久会員。' },
        nav: { features: '機能', pricing: '料金', faq: 'よくある質問', about: '概要', loginBtn: '🔑 ログイン', permanentMember: '★ 永久会員', payBtn: '💎 更新', logout: 'ログアウト' },
        hero: { badge: '⚡ 48処理モード · 4ファミリー · HPSS v5', title1: 'AI音楽を', title2: '人間らしく', desc: 'vitqaはHPSSスマート分離技術でAI音楽の背景レイヤーを処理。<br>ボーカル品質を保ちながらAI検出を回避します。', ctaStart: '🚀 処理開始', ctaLogin: 'ログイン / 登録', statAI: '平均AI確率', statBitrate: 'CBR出力', statSpeed: '平均処理時間' },
        techstack: { title: 'コア技術スタック', sub: '精密に調整された完全パイプライン', headerLine: '═══ CORE TECH STACK ═══', layer1: 'HPSS 高調波分離層', layer2: '知覚符号化層', layer3: '検出回避層' },
        benchmark: { title: 'AI検出ベンチマーク', sub: '32の商用検出器によるクロスバリデーション', colModel: '🎯 AI検出モデル', colBefore: '処理前', colAfter: '処理後', avg: '📊 平均' },
        features: { title: 'vitqaを選ぶ理由', sub: '実際の検出環境で最適化された48段階処理', cards: [
            { title: 'HPSSスマート分離', desc: 'STFTベース適応フィルタで高調波/打楽器を96.3%精度で分離。' },
            { title: 'ボーカル無劣化', desc: 'ボーカル24%保持、ミックス比1.6:0.4で自然なスペクトル密度。' },
            { title: '実証済みの結果', desc: '32商用検出器で平均AI確率12.5%（閾値50%）。' },
            { title: '48処理モード', desc: '4ファミリー×4サブ技術×3強度=48モード。全シーン対応。' },
            { title: '128k基準', desc: '128kbps CBR最小出力。LAME心理音響モデルIIで再圧縮リスクなし。' },
            { title: '超高速処理', desc: 'FFmpeg 7.0、3.2倍リアルタイム処理。4分曲を約2.4秒。' },
        ] },
        pipeline: { title: '処理パイプライン', sub: '全工程を精密調整', steps: [
            { title: '音声アップロード', desc: 'FFmpeg 7.0 avformatデコード→12コーデック対応→44.1kHz自動リサンプル' },
            { title: 'HPSS分離', desc: 'STFT→Hann 2048ウィンドウ·hop 512·中央値フィルタ分離·精度96.3%' },
            { title: 'エンコード難読化', desc: 'LAME MP3心理音響モデルII·動的マスキング·敵対的ノイズ·統計的整合' },
            { title: 'ミックス出力', desc: '高調波/打楽器融合·128k CBR最終エンコード·MD5チェックサム' },
        ] },
        converter: {
            title: 'AI検出回避処理', sub: 'ファイルをドラッグ＆ドロップ',
            guestTitle: '会員限定', guestDesc: '会員購入ですべての機能を利用可能', guestLogin: 'ログイン / 登録', guestBuy: '会員購入',
            uploadText: 'ここにファイルをドロップ', uploadHint: 'WAV/MP3/FLAC/M4A/OGG/AAC対応、最大100MB', uploadBtn: 'ファイル選択',
            modeTitle: 'モード選択 — 4ファミリー 48の精密調整モード', selectedLabel: '現在の選択', modeSubtitle: 'カードをクリックして選択、タップで詳細を表示',
            families: [
                { name: 'スペクトル', desc: 'スペクトル分解ベースの検出回避' },
                { name: '時間領域', desc: '時間領域パラメータベースの検出回避' },
                { name: '心理音響', desc: '知覚モデルベースの検出回避' },
                { name: 'ハイブリッド', desc: '複合技術による最大検出回避' }
            ],
            substrengths: { light: '軽度', medium: '中度', heavy: '強度' },
            subs: ['HPSS分離', '摂動', '再合成', 'フォルマント', 'ジッター', 'トランジェント', 'ストレッチ', 'サチュレート', 'ノイズ', 'マスク', 'マルチバンド', 'デコリレーション', '標準', 'ディープ', 'オブリビオン', 'Nova'],
            modes: EN_MODES_DATA,
            convertBtn: '変換開始', progress: '処理中...', resultTitle: '完了！', resultDuration: '処理時間', resultSize: 'ファイルサイズ', resultFormat: 'フォーマット', download: 'ダウンロード', next: '次の曲を処理',
        },
        modeCompare: { title: 'モード比較', sub: '各モードの特性', colMode: 'モード', colBitrate: 'ビットレート', colTech: 'コア技術', colVocal: 'ボーカル', colDetection: '回避強度', colScene: '最適シーン' },
        pricing: { title: 'シンプルな料金', sub: '一回払い、永続利用', badge: '🔥 人気', tier_1d: '1日VIP', tier_1m: '1ヶ月VIP', tier_perm: '永久VIP', price_1d: '¥8.8', price_1m: '¥98', price_perm: '¥198', desc_1d: '24時間お試し', desc_1m: '30日間短期利用', desc_perm: '永久利用、一回支払い', feature_all: '全機能', feature_perm_bonus: '友達招待で割引', buy_1d: '¥8.8 購入', buy_1m: '¥98 購入', buy_perm: '¥198 購入', shareBtn: '📱 友達招待で最大50%OFF', discount: '紹介割引', original: '通常価格 ¥198', youSave: '¥39.6お得' },
        referral: { title: '友達招待で割引', desc: '友達1人登録ごとに5%OFF<br>10人で半額！', progress: '紹介進捗', share_link_label: '紹介リンク', copy_btn: 'コピー', linkCopied: '紹介リンクをコピーしました！', current_discount: '現在の割引', original_price: '通常価格 ¥198', saved: 'お得', no_discount_yet: 'まだ割引なし。友達を招待しましょう！' },
        testimonials: { title: 'ユーザーレビュー', sub: 'vitqaユーザーの声', items: [
            { text: '"vitqaを使ったらSunoの曲がプラットフォーム審査に通りました！"', author: '— プロデューサー アキラ' },
            { text: '"いくつか比較しましたが、vitqaのHPSSが一番効果的。48モードで全てカバー。"', author: '— AI音楽クリエイター Yuki' },
            { text: '"¥198永久会員は非常にお得。Nova中程度が厳格プラットフォームでも効果抜群。"', author: '— 独立系アーティスト Ken' },
        ] },
        faq: { title: 'よくある質問', sub: 'vitqaについて知りたいこと', items: [
            { q: 'HPSSとは？', a: 'HPSSは音楽を高調波層（ボーカル）と打楽器層（背景リズム）に分離します。vitqaは背景のみを処理します。' },
            { q: 'なぜAI検出回避が必要？', a: 'プラットフォームがAI生成検出ツールを使用。AI判定された曲は制限対象に。HPSS処理で統計的特徴を正常化。' },
            { q: '会員料金は？', a: '永久会員は<strong>¥198</strong>、一回払いで永続利用、更新不要。微信支付対応。' },
            { q: '支払い方法は？', a: '<strong>微信支付</strong>（QRコード）とUSDT (TRC-20)に対応。' },
            { q: '処理時間は？', a: 'FFmpegパイプラインで4分曲を平均<strong>2.4秒</strong>で処理。' },
            { q: '48モードの違いは？', a: '4ファミリー×4サブ技術×3強度=48モード。<strong>スペクトル</strong>/<strong>時間領域</strong>/<strong>心理音響</strong>/<strong>ハイブリッド</strong>。Novaが最強スーパーモード。' },
        ] },
        share: { title: 'vitqaをシェア', desc: '役に立ちましたか？共有しましょう：', copy: 'リンクをコピー', linkCopied: 'リンクをコピーしました！', wechat: '📱 WeChat', moments: '🌐 モーメンツ', douyin: '🎵 Douyin', xianyu: '🏪 Xianyu', kuaishou: '📹 Kuaishou', xiaohongshu: '📕 小紅書', weibo: '🐦 Weibo', wechat_text: '🎵 AI音楽制作に必須！vitqa 48モード+Nova。¥198永久会員：https://vitqa.com/?ref=CODE', moments_text: '🔥 vitqa発見！48モード+HPSS分離+Nova。¥198永久会員+友達割引！https://vitqa.com/?ref=CODE', douyin_text: '🔥 AI音楽検出問題？vitqaで解決！48モード+Nova。リンクから割引！https://vitqa.com/?ref=CODE', xianyu_text: '🎵 AI音楽検出回避、48モード。¥198永久会員。HPSS+Nova。追加割引：https://vitqa.com/?ref=CODE', kuaishou_text: '🔥 vitqa 48モード！HPSS分離、平均AI 12.5%！リンクから：https://vitqa.com/?ref=CODE', xiaohongshu_text: '🎵 vitqa発見✨ 48モード+Novaスーパーモード。¥198永久会員👇 https://vitqa.com/?ref=CODE', weibo_text: '#AI音楽 #vitqa 48モード+Novaスーパーモード。¥198永久会員+友達割引！https://vitqa.com/?ref=CODE' },
        about: { title: 'vitqaについて', p1: 'vitqaはHPSS高調波-打楽器分離技術に基づくAI音楽検出回避エンジン。<strong>ボーカル（高調波）</strong>と<strong>背景（打楽器）</strong>を正確に分離し、背景のみを処理。', p2: '20回以上のテストで128kbps CBR出力、平均AI確率<strong>12.5%</strong>を達成。' },
        loginModal: { title: 'ログイン / 登録', sub: 'メールでログインまたは登録', loginTab: 'ログイン', registerTab: '登録', emailPlaceholder: 'メールアドレス', passPlaceholder: 'パスワード', regPassPlaceholder: 'パスワード（6文字以上）', regConfirmPlaceholder: '確認', codePlaceholder: '認証コード', sendCodeBtn: 'コード送信', loginBtn: 'ログイン', registerBtn: '登録' },
        payment: { modalTitle: '永久会員購入', modalDesc: '微信支付 <strong>¥198</strong>', scanHint: '微信でスキャン', loading: 'QRコード生成中...' },
        footer: { desc: 'AI音楽検出回避 · 48モード · HPSS', login: '会員ログイン', buy: '会員購入', features: '機能', faq: 'FAQ' },
        already_member: 'すでに会員です', pay_failed: '支払い失敗', qr_title: '微信支付', qr_expire: 'QRコード有効期限1時間', qr_close_hint: '支払い完了後に閉じる', permanent_member: '★ 永久VIP', vip_1d_member: '☆ 1日VIP', vip_1m_member: '☆ 1ヶ月VIP',
        strength_names: ['軽度', '中度', '強度'],
        toast: { addressCopied: '✅ コピーしました', linkCopied: '✅ リンクをコピーしました！', walletConnected: '✅ ウォレット接続', paymentSent: '⏳ 支払い送信', paymentConfirmed: '✅ 会員有効化！' },
    },
    'ko': {
        name: '한국어', flag: '🇰🇷',
        meta: { title: 'vitqa — AI 음악 감지 회피 | 사람 같은 음질 유지', description: 'vitqa는 HPSS 고조파 분리 기술 기반 AI 음악 감지 회피 플랫폼. 48가지 처리 모드. 평생 회원 ¥198.', ogTitle: 'vitqa — AI 음악 감지 회피', ogDesc: 'HPSS 기반 AI 음악 감지 회피. 48처리 모드. 위챗페이 ¥198 평생 회원.', twitterDesc: 'HPSS 분리로 AI 음악을 인간처럼. 48모드. 위챗페이 ¥198 평생 회원.' },
        nav: { features: '기능', pricing: '가격', faq: 'FAQ', about: '정보', loginBtn: '🔑 로그인', permanentMember: '★ 평생 회원', payBtn: '💎 갱신', logout: '로그아웃' },
        hero: { badge: '⚡ 48처리 모드 · 4개 시리즈 · HPSS v5', title1: 'AI 음악을', title2: '사람처럼 만듭니다', desc: 'vitqa는 HPSS 스마트 분리 기술로 AI 음악 배경 레이어를 처리합니다.', ctaStart: '🚀 처리 시작', ctaLogin: '로그인 / 등록', statAI: '평균 AI 확률', statBitrate: 'CBR 출력', statSpeed: '평균 처리 시간' },
        techstack: { title: '핵심 기술 스택', sub: '정밀하게 조정된 완전 파이프라인', headerLine: '═══ CORE TECH STACK ═══', layer1: 'HPSS 고조파 분리층', layer2: '지각 부호화층', layer3: '탐지 회피층' },
        benchmark: { title: 'AI 탐지 벤치마크', sub: '32개 상용 탐지기 교차 검증', colModel: '🎯 AI 탐지 모델', colBefore: '처리 전', colAfter: '처리 후', avg: '📊 평균' },
        features: { title: 'vitqa를 선택해야 하는 이유', sub: '실제 감지 환경에 최적화된 48단계 처리', cards: [
            { title: 'HPSS 스마트 분리', desc: 'STFT 기반 적응형 필터로 고조파/타악기 96.3% 정확도 분리.' },
            { title: '보컬 무손실', desc: '보컬 24% 유지, 믹스비 1.6:0.4로 자연스러운 스펙트럼 밀도.' },
            { title: '검증된 결과', desc: '32개 상용 탐지기 교차 검증. 평균 AI 확률 12.5%（임계치 50%）.' },
            { title: '48처리 모드', desc: '4개 시리즈×4서브 기술×3강도=48모드. 전 시나리오 커버.' },
            { title: '128k 기준', desc: '128kbps CBR 최소 출력. LAME 심리음향 모델 II로 재압축 위험 없음.' },
            { title: '초고속 처리', desc: 'FFmpeg 7.0, 3.2배 실시간 처리. 4분 곡 약 2.4초.' },
        ] },
        pipeline: { title: '처리 파이프라인', sub: '전 공정 정밀 조정', steps: [
            { title: '오디오 업로드', desc: 'FFmpeg 7.0 avformat 디코드→12코덱 지원→44.1kHz 자동 리샘플' },
            { title: 'HPSS 분리', desc: 'STFT→Hann 2048 윈도우·hop 512·중앙값 필터 분리·정확도 96.3%' },
            { title: '인코딩 난독화', desc: 'LAME MP3 심리음향 모델 II·동적 마스킹·적대적 노이즈·통계 정렬' },
            { title: '믹스 출력', desc: '고조파/타악기 융합·128k CBR 최종 인코딩·MD5 체크섬' },
        ] },
        converter: {
            title: 'AI 감지 회피 처리', sub: '드래그 앤 드롭 또는 파일 선택',
            guestTitle: '회원 전용', guestDesc: '회원 구매 시 모든 기능 이용 가능', guestLogin: '로그인 / 등록', guestBuy: '회원 구매',
            uploadText: '오디오 파일을 여기에 드롭', uploadHint: 'WAV/MP3/FLAC/M4A/OGG/AAC 지원, 최대 100MB', uploadBtn: '파일 선택',
            modeTitle: '모드 선택 — 4개 시리즈 48개 정밀 조정 모드', selectedLabel: '현재 선택', modeSubtitle: '카드 클릭하여 선택, 탭하여 세부 정보 보기',
            families: [
                { name: '스펙트럼', desc: '스펙트럼 분해 기반 탐지 회피' },
                { name: '시간 영역', desc: '시간 영역 파라미터 기반 탐지 회피' },
                { name: '심리 음향', desc: '지각 모델 기반 탐지 회피' },
                { name: '하이브리드', desc: '복합 기술 기반 최대 탐지 회피' }
            ],
            substrengths: { light: '경도', medium: '중도', heavy: '강도' },
            subs: ['HPSS분리', '섭동', '재합성', '포먼트', '지터', '트랜지언트', '스트레치', '포화', '노이즈', '마스크', '멀티밴드', '디코릴레이션', '표준', '딥', '오블리비언', '노바'],
            modes: EN_MODES_DATA,
            convertBtn: '변환 시작', progress: '처리 중...', resultTitle: '완료!', resultDuration: '처리 시간', resultSize: '파일 크기', resultFormat: '형식', download: '다운로드', next: '다음 곡 처리',
        },
        modeCompare: { title: '모드 비교', sub: '각 모드의 특성', colMode: '모드', colBitrate: '비트레이트', colTech: '핵심 기술', colVocal: '보컬', colDetection: '회피 강도', colScene: '최적 용도' },
        pricing: { title: '간단한 가격', sub: '일회성 결제, 평생 이용', badge: '🔥 인기', tier_1d: '1일VIP', tier_1m: '1개월VIP', tier_perm: '영구 VIP', price_1d: '¥8.8', price_1m: '¥98', price_perm: '¥198', desc_1d: '24시간 체험용', desc_1m: '30일 단기 사용', desc_perm: '영구 사용, 한 번 결제', feature_all: '모든 기능', feature_perm_bonus: '친구 초대 할인', buy_1d: '¥8.8 구매', buy_1m: '¥98 구매', buy_perm: '¥198 구매', shareBtn: '📱 친구 초대로 최대 50% 할인', discount: '초대 할인', original: '정상 가격 ¥198', youSave: '¥39.6 절약' },
        referral: { title: '친구 초대로 할인', desc: '친구 1명 가입마다 5% 할인<br>10명이면 50% 할인!', progress: '추천 진행', share_link_label: '추천 링크', copy_btn: '복사', linkCopied: '추천 링크 복사 완료!', current_discount: '현재 할인', original_price: '정상 가격 ¥198', saved: '절약', no_discount_yet: '아직 할인 없음. 친구 초대하세요!' },
        testimonials: { title: '사용자 리뷰', sub: 'vitqa 사용자들의 이야기', items: [
            { text: '"vitqa 사용 후 Suno 트랙이 플랫폼 심사를 통과했습니다!"', author: '— 프로듀서 지민' },
            { text: '"여러 서비스 비교했는데 vitqa의 HPSS가 가장 효과적. 48모드로 모든 상황 커버."', author: '— AI 음악 크리에이터 수진' },
            { text: '"¥198 평생 회원 가성비 최고. Nova 중간 모드가 엄격한 플랫폼에서도 효과 만점."', author: '— 인디 아티스트 태호' },
        ] },
        faq: { title: '자주 묻는 질문', sub: 'vitqa에 대해 알아보기', items: [
            { q: 'HPSS란?', a: 'HPSS는 음악을 고조파 층(보컬)과 타악기 층(배경 리듬)으로 분리합니다. vitqa는 배경만 처리합니다.' },
            { q: 'AI 감지 회피가 왜 필요한가요?', a: '플랫폼이 AI 생성 탐지 도구 사용. AI 판정 곡은 제한 대상. HPSS 처리로 통계적 특징 정상화.' },
            { q: '회원 요금은?', a: '평생 회원 <strong>¥198</strong>, 일회성 결제, 갱신 불필요. 위챗페이 지원.' },
            { q: '결제 방식은?', a: '<strong>위챗페이</strong>(QR 코드)와 USDT (TRC-20) 지원.' },
            { q: '처리 시간은?', a: 'FFmpeg 파이프라인으로 4분 곡 평균 <strong>2.4초</strong>.' },
            { q: '48모드 차이점은?', a: '4개 시리즈×4서브 기술×3강도=48모드. <strong>스펙트럼</strong>/<strong>시간영역</strong>/<strong>심리음향</strong>/<strong>하이브리드</strong>. Nova가 최강 슈퍼모드.' },
        ] },
        share: { title: 'vitqa 공유', desc: '도움이 되셨나요? 공유하세요:', copy: '링크 복사', linkCopied: '링크 복사 완료!', wechat: '📱 위챗', moments: '🌐 모먼트', douyin: '🎵 더우인', xianyu: '🏪 셴위', kuaishou: '📹 콰이쇼우', xiaohongshu: '📕 샤오홍슈', weibo: '🐦 웨이보', weibo_text: '#AI음악 #vitqa 48모드+Nova. ¥198+친구 할인! https://vitqa.com/?ref=CODE' },
        about: { title: 'vitqa 정보', p1: 'vitqa는 HPSS 고조파-타악기 분리 기술 기반 AI 음악 감지 우회 엔진.<strong>보컬</strong>과<strong>배경</strong>을 정확히 분리, 배경만 처리.', p2: '20회 이상 테스트로 128kbps CBR 출력, 평균 AI 확률<strong>12.5%</strong> 달성.' },
        loginModal: { title: '로그인 / 등록', sub: '이메일로 로그인 또는 등록', loginTab: '로그인', registerTab: '등록', emailPlaceholder: '이메일', passPlaceholder: '비밀번호', regPassPlaceholder: '비밀번호 (6자 이상)', regConfirmPlaceholder: '확인', codePlaceholder: '인증 코드', sendCodeBtn: '코드 전송', loginBtn: '로그인', registerBtn: '등록' },
        payment: { modalTitle: '평생 회원 구매', modalDesc: '위챗페이 <strong>¥198</strong>', scanHint: '위챗으로 스캔', loading: 'QR 코드 생성 중...' },
        footer: { desc: 'AI 음악 감지 우회 · 48모드 · HPSS', login: '회원 로그인', buy: '회원 구매', features: '기능', faq: 'FAQ' },
        already_member: '이미 회원입니다', pay_failed: '결제 실패', qr_title: '위챗페이', qr_expire: 'QR코드 유효시간 1시간', qr_close_hint: '결제 완료 후 닫기', permanent_member: '★ 영구 VIP', vip_1d_member: '☆ 1일 VIP', vip_1m_member: '☆ 1개월 VIP',
        strength_names: ['경도', '중도', '강도'],
        toast: { addressCopied: '✅ 복사 완료', linkCopied: '✅ 링크 복사 완료!', walletConnected: '✅ 지갑 연결됨', paymentSent: '⏳ 결제 제출됨', paymentConfirmed: '✅ 회원 활성화!' },
    },
};

// ─── i18n Engine ─────────────────────────────────────────────

function getBrowserLang() {
    const lang = navigator.language || navigator.userLanguage || 'zh-CN';
    const base = lang.split('-')[0];
    if (base === 'zh') return 'zh-CN';
    if (base === 'ja') return 'ja';
    if (base === 'ko') return 'ko';
    return 'en';
}

function getSavedLang() {
    try { return localStorage.getItem('vitqa_lang') || getBrowserLang(); } catch(e) { return 'zh-CN'; }
}

function t(key) {
    const lang = getSavedLang();
    const keys = key.split('.');
    let val = LANGUAGES[lang] || LANGUAGES['en'];
    for (let k of keys) {
        if (val && val[k] !== undefined) val = val[k];
        else return key;
    }
    return val || key;
}

function applyLang() {
    const lang = getSavedLang();
    const data = LANGUAGES[lang];
    if (!data) return;

    document.documentElement.lang = lang;

    if (data.meta) {
        document.title = data.meta.title || document.title;
        updateMeta('description', data.meta.description);
        updateMeta('og:title', data.meta.ogTitle);
        updateMeta('og:description', data.meta.ogDesc);
        updateMeta('twitter:description', data.meta.twitterDesc);
        updateMeta('twitter:title', data.meta.ogTitle);
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = t(key);
        if (text && typeof text === 'string') {
            el.innerHTML = text;
        }
    });

    const sw = document.getElementById('langSwitcher');
    if (sw) {
        sw.innerHTML = Object.entries(LANGUAGES).map(([code, l]) =>
            '<div class="lang-option ' + (code === lang ? 'active' : '') + '" data-lang="' + code + '" onclick="setLang(\'' + code + '\')">' + l.flag + ' ' + l.name + '</div>'
        ).join('');
    }
    const swBtn = document.getElementById('langBtn');
    if (swBtn) {
        swBtn.innerHTML = data.flag + ' ' + data.name + ' <span class="lang-arrow">▾</span>';
    }

    if (typeof buildModeCards === 'function') {
        buildModeCards();
    }
}

function updateMeta(name, content) {
    if (!content) return;
    let el = document.querySelector('meta[property="' + name + '"], meta[name="' + name + '"]');
    if (!el) {
        el = document.createElement('meta');
        if (name.startsWith('og:')) el.setAttribute('property', name);
        else el.setAttribute('name', name);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function setLang(code) {
    try { localStorage.setItem('vitqa_lang', code); } catch(e) {}
    applyLang();
    const dd = document.getElementById('langDropdown');
    if (dd) dd.classList.add('hidden');
}

applyLang();
document.addEventListener('DOMContentLoaded', function() {
    applyLang();
    setTimeout(applyLang, 100);
});

document.addEventListener('click', function(e) {
    const wrap = document.getElementById('langSwitcherWrap');
    const dd = document.getElementById('langDropdown');
    if (wrap && dd && !wrap.contains(e.target)) {
        dd.classList.add('hidden');
    }
});

console.log('vitqa i18n loaded - 48 modes with detail - lang:', getSavedLang());
