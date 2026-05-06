/* vitqa i18n - Multi-language support */
const LANGUAGES = {
    'zh-CN': {
        name: '中文',
        flag: '🇨🇳',
        meta: {
            title: 'vitqa — AI音乐去AI处理平台 | 绕过AI检测，保留人声品质',
            description: 'vitqa 是AI音乐去检测处理平台，基于HPSS谐波分离技术。让你的Suno/Udio AI生成音乐通过AI检测，永久会员仅20 USDT。',
            ogTitle: 'vitqa — AI音乐去AI处理平台',
            ogDesc: '基于HPSS谐波分离技术，让你的AI音乐通过检测。三档处理模式，100%保留人声品质。',
            twitterDesc: 'HPSS谐波分离，让AI音乐人耳听不出、机器检不出。20 USDT永久会员。',
        },
        nav: {
            features: '功能',
            pricing: '定价',
            about: '关于',
            connectWallet: '连接钱包登录',
            permanentMember: '★ 永久会员',
            logout: '退出',
        },
        hero: {
            badge: '⚡ HPSS v2 优化引擎',
            title1: '让AI音乐',
            title2: '听起来像人做的',
            desc: 'vitqa 基于 HPSS 智能分离技术，对 AI 生成音乐的背景层进行编码处理，保留人声原始质感，优雅绕过音频平台的 AI 检测。',
            ctaStart: '🚀 开始处理',
            ctaWallet: '钱包登录',
            statAI: '平均AI概率',
            statBitrate: 'CBR无损输出',
            statSpeed: '平均处理时间',
        },
        features: {
            title: '为什么选择 vitqa',
            sub: '基于真实对抗检测数据优化的三档处理方案',
            cards: [
                { icon: '🎯', title: 'HPSS 智能分离', desc: '谐波-打击乐分离算法，精准提取人声与背景音轨，仅对背景层编码处理。' },
                { icon: '🔊', title: '人声无损保留', desc: '原始人声占比 24%，混音比 1.6:0.4，在逃避检测的同时保持听觉完整性。' },
                { icon: '📊', title: '真实数据验证', desc: '经多轮汽水音乐平台检测验证，12.5% 平均 AI 概率，远低于 50% 判定线。' },
                { icon: '⚡', title: '三档处理模式', desc: 'Standard / Gentle / Aggressive 三档可选，适应不同平台与音乐风格。' },
                { icon: '🔒', title: '128k 硬性标准', desc: '输出码率不低于 128kbps CBR，满足所有主流音频平台的最低质量红线。' },
                { icon: '🚀', title: '秒级处理速度', desc: '基于 FFmpeg 的高效处理管道，平均处理一首 4 分钟歌曲仅需 2.4 秒。' },
            ],
        },
        converter: {
            title: '音乐去AI处理',
            sub: '拖拽上传或点击选择音频文件',
            guestTitle: '仅限会员使用',
            guestDesc: '永久会员仅需 20 USDT，支持 TRC-20 加密钱包支付',
            guestLogin: '连接钱包登录',
            guestBuy: '购买会员',
            uploadText: '拖拽音频文件到此处',
            uploadHint: '支持 WAV / MP3 / FLAC / M4A / OGG / AAC，最大 100MB',
            uploadBtn: '选择文件',
            modeTitle: '选择处理模式',
            modes: [
                { name: 'Standard', badge: '推荐', desc: '人声24% · 背景48k · 混音1.6:0.4', result: '平均AI概率 12.5%' },
                { name: 'Gentle', badge: '高品质', desc: '人声30% · 背景64k · 混音2.0:0.5', result: '更高音质 · 检测概率略高' },
                { name: 'Aggressive', badge: '强绕过', desc: '人声16% · 背景32k · 混音1.0:0.3', result: '最强绕过 · 音质略损' },
            ],
            convertBtn: '✨ 开始转换',
            progress: '处理中...',
            resultTitle: '处理完成！',
            resultDuration: '处理耗时',
            resultSize: '文件大小',
            resultFormat: '输出格式',
            download: '⬇️ 下载处理后的文件',
            next: '处理下一首',
        },
        pricing: {
            title: '简单透明的定价',
            sub: '永久会员，一次付费，永久使用',
            badge: '🔥 最受欢迎',
            plan: 'Permanent',
            price: '20',
            currency: 'USDT',
            period: '一次性付费 · 永久有效',
            features: [
                '✓ HPSS 智能音频处理',
                '✓ 三档模式自由切换',
                '✓ 无限转换次数',
                '✓ 128k CBR 高品质输出',
                '✓ 永久有效，无需续费',
                '✓ 支持 TRC-20 钱包支付',
            ],
            cta: '💎 立即购买',
        },
        share: {
            title: '分享 vitqa',
            desc: '如果你觉得 vitqa 好用，分享给更多需要的人：',
        },
        about: {
            title: '关于 vitqa',
            p1: 'vitqa 是一套基于 HPSS 谐波-打击乐分离技术的 AI 音乐去检测引擎。与传统"降码率"逃避方案不同，vitqa 精确分离音乐的人声层（谐波）与背景层（打击乐/乐器），仅对背景层进行编码混淆处理，保留人声的原始质感和动态范围。',
            p2: '经过 20+ 轮汽水音乐平台检测环境的验证测试，Optimized v2 方案在保持 128kbps CBR 输出质量的前提下，将平均 AI 检测概率稳定控制在 12.5%，远低于平台判定阈值（50%）。覆盖曲风包括流行、摇滚、叙事古风、电子等多种风格，具有横向可迁移性。',
        },
        wallet: {
            modalTitle: '连接钱包',
            modalDesc: '连接钱包以登录 vitqa',
            metamask: 'MetaMask',
            walletconnect: 'WalletConnect',
            signNote: '连接后需签名消息完成身份验证',
        },
        payment: {
            modalTitle: '购买永久会员',
            modalDesc: '发送 20 USDT (TRC-20) 到以下地址',
            addressLabel: '收款地址',
            copyBtn: '📋 复制地址',
            network: 'TRC-20',
            currency: 'USDT',
            steps: [
                '1. 打开 MetaMask 或支持 TRC-20 的钱包',
                '2. 添加 USDT 代币 (TRC-20 网络)',
                '3. 发送 20 USDT 到上方地址',
                '4. 输入交易哈希完成验证',
            ],
            verifyTitle: '已发送？在此验证：',
            verifyPlaceholder: '交易哈希 (Tx Hash)',
            verifyBtn: '验证',
        },
        footer: {
            desc: 'AI音乐去检测处理平台',
            login: '会员登录',
            buy: '购买会员',
            features: '功能介绍',
        },
        freeTrial: {
                badge: "免费试用",
                remaining: "次剩余",
                desc: "免费试用2次",
                cta: "处理后需连接钱包下载",
            },
        toast: {
            addressCopied: '✅ 地址已复制',
            linkCopied: '✅ 链接已复制！',
            walletConnected: '✅ 钱包已连接',
            paymentSent: '⏳ 付款已提交，等待验证',
            paymentConfirmed: '✅ 会员已激活！',
        },
    },
    'en': {
        name: 'English',
        flag: '🇬🇧',
        meta: {
            title: 'vitqa — AI Music Humanizer | Bypass AI Detection, Keep Vocal Quality',
            description: 'vitqa is an AI music de-detection platform based on HPSS harmonic separation. Make your Suno/Udio AI music pass detection. Lifetime membership 20 USDT.',
            ogTitle: 'vitqa — AI Music Humanizer',
            ogDesc: 'HPSS-based AI music detection bypass. Three processing modes, 100% vocal preservation.',
            twitterDesc: 'HPSS harmonic separation makes AI music sound human and undetectable. 20 USDT lifetime.',
        },
        nav: {
            features: 'Features',
            pricing: 'Pricing',
            about: 'About',
            connectWallet: 'Connect Wallet',
            permanentMember: '★ Lifetime Member',
            logout: 'Logout',
        },
        hero: {
            badge: '⚡ HPSS v2 Engine',
            title1: 'Make AI Music',
            title2: 'Sound Human Again',
            desc: 'vitqa uses HPSS smart separation to encode the background layer of AI-generated music.<br>Preserve raw vocal quality. Elegantly bypass AI detection.',
            ctaStart: '🚀 Start Processing',
            ctaWallet: 'Connect Wallet',
            statAI: 'Avg AI Probability',
            statBitrate: 'CBR Output',
            statSpeed: 'Avg Processing',
        },
        features: {
            title: 'Why vitqa',
            sub: 'Three-tier processing optimized against real detection benchmarks',
            cards: [
                { icon: '🎯', title: 'HPSS Smart Separation', desc: 'Harmonic-percussive separation precisely extracts vocals and background, encoding only the background layer.' },
                { icon: '🔊', title: 'Lossless Vocals', desc: '24% vocal ratio with 1.6:0.4 mix preserves audio integrity while evading detection.' },
                { icon: '📊', title: 'Proven Results', desc: 'Multiple rounds of testing show 12.5% average AI probability, well below the 50% threshold.' },
                { icon: '⚡', title: 'Three Processing Modes', desc: 'Standard / Gentle / Aggressive modes for different platforms and music styles.' },
                { icon: '🔒', title: '128k Standard', desc: 'Minimum 128kbps CBR output meets all major platform quality requirements.' },
                { icon: '🚀', title: 'Lightning Fast', desc: 'FFmpeg-powered pipeline processes a 4-minute track in just 2.4 seconds on average.' },
            ],
        },
        converter: {
            title: 'De-AI Processing',
            sub: 'Drag & drop or click to select audio',
            guestTitle: 'Members Only',
            guestDesc: 'Lifetime membership for just 20 USDT, TRC-20 crypto payment',
            guestLogin: 'Connect Wallet',
            guestBuy: 'Buy Membership',
            uploadText: 'Drop audio file here',
            uploadHint: 'Supports WAV / MP3 / FLAC / M4A / OGG / AAC, max 100MB',
            uploadBtn: 'Select File',
            modeTitle: 'Choose Processing Mode',
            modes: [
                { name: 'Standard', badge: 'Recommended', desc: 'Vocal 24% · BG 48k · Mix 1.6:0.4', result: 'Avg AI 12.5%' },
                { name: 'Gentle', badge: 'High Quality', desc: 'Vocal 30% · BG 64k · Mix 2.0:0.5', result: 'Better quality, slightly higher detection' },
                { name: 'Aggressive', badge: 'Max Bypass', desc: 'Vocal 16% · BG 32k · Mix 1.0:0.3', result: 'Strongest bypass, some quality loss' },
            ],
            convertBtn: '✨ Start Conversion',
            progress: 'Processing...',
            resultTitle: 'Complete!',
            resultDuration: 'Duration',
            resultSize: 'Size',
            resultFormat: 'Format',
            download: '⬇️ Download Processed File',
            next: 'Process Next Track',
        },
        pricing: {
            title: 'Simple Pricing',
            sub: 'One-time payment, lifetime access',
            badge: '🔥 Most Popular',
            plan: 'Permanent',
            price: '20',
            currency: 'USDT',
            period: 'One-time · Lifetime Access',
            features: [
                '✓ HPSS Smart Audio Processing',
                '✓ Three Processing Modes',
                '✓ Unlimited Conversions',
                '✓ 128k CBR High Quality Output',
                '✓ Lifetime, No Renewal',
                '✓ TRC-20 Wallet Payment',
            ],
            cta: '💎 Buy Now',
        },
        share: {
            title: 'Share vitqa',
            desc: 'Found vitqa useful? Share it with others who need it:',
        },
        about: {
            title: 'About vitqa',
            p1: 'vitqa is an AI music detection bypass engine based on HPSS harmonic-percussive source separation. Unlike traditional "reduce bitrate" approaches, vitqa precisely separates vocals (harmonic) from background (percussive/instrumental), encoding only the background layer to confuse detection while preserving vocal quality and dynamics.',
            p2: 'After 20+ rounds of testing against music platform detection systems, the Optimized v2 pipeline achieves 12.5% average AI probability at 128kbps CBR output quality — well below the 50% threshold. Tested across pop, rock, folk, electronic, and other genres with consistent results.',
        },
        wallet: {
            modalTitle: 'Connect Wallet',
            modalDesc: 'Connect your wallet to login',
            metamask: 'MetaMask',
            walletconnect: 'WalletConnect',
            signNote: 'You will need to sign a message to verify ownership',
        },
        payment: {
            modalTitle: 'Buy Lifetime Membership',
            modalDesc: 'Send 20 USDT (TRC-20) to the address below',
            addressLabel: 'Payment Address',
            copyBtn: '📋 Copy Address',
            network: 'TRC-20',
            currency: 'USDT',
            steps: [
                '1. Open MetaMask or TRC-20 compatible wallet',
                '2. Add USDT token (TRC-20 network)',
                '3. Send 20 USDT to the address above',
                '4. Enter transaction hash to verify',
            ],
            verifyTitle: 'Already sent? Verify here:',
            verifyPlaceholder: 'Transaction Hash (Tx Hash)',
            verifyBtn: 'Verify',
        },
        footer: {
            desc: 'AI Music Detection Bypass Platform',
            login: 'Member Login',
            buy: 'Buy Membership',
            features: 'Features',
        },
        toast: {
            addressCopied: '✅ Address copied',
            linkCopied: '✅ Link copied!',
            walletConnected: '✅ Wallet connected',
            paymentSent: '⏳ Payment submitted, waiting for verification',
            paymentConfirmed: '✅ Membership activated!',
        },
    },
    'ja': {
        name: '日本語',
        flag: '🇯🇵',
        meta: {
            title: 'vitqa — AI音楽検出回避 | 人間らしい音質を維持',
            description: 'vitqaはHPSS高調波分離技術に基づくAI音楽検出回避プラットフォーム。Suno/UdioのAI生成音楽を検出から守ります。永久会員20 USDT。',
            ogTitle: 'vitqa — AI音楽検出回避',
            ogDesc: 'HPSSベースのAI音楽検出回避。3つの処理モード、ボーカル品質を100%維持。',
            twitterDesc: 'HPSS高調波分離でAI音楽を人間らしく。20 USDT永久会員。',
        },
        nav: {
            features: '機能',
            pricing: '料金',
            about: '概要',
            connectWallet: 'ウォレット接続',
            permanentMember: '★ 永久会員',
            logout: 'ログアウト',
        },
        hero: {
            badge: '⚡ HPSS v2 エンジン',
            title1: 'AI音楽を',
            title2: '人間らしく',
            desc: 'vitqaはHPSSスマート分離技術でAI音楽の背景レイヤーをエンコード処理。<br>ボーカル品質を保ちながらAI検出を回避します。',
            ctaStart: '🚀 処理を開始',
            ctaWallet: 'ウォレット接続',
            statAI: '平均AI確率',
            statBitrate: 'CBR出力',
            statSpeed: '平均処理時間',
        },
        features: {
            title: 'vitqaを選ぶ理由',
            sub: '実際の検出環境で最適化された3段階処理',
            cards: [
                { icon: '🎯', title: 'HPSSスマート分離', desc: '高調波-打楽器分離アルゴリズムで正確にボーカルと背景を分離。' },
                { icon: '🔊', title: 'ボーカル無劣化', desc: 'ボーカル比率24%、ミックス比1.6:0.4で検出を回避しつつ音質を維持。' },
                { icon: '📊', title: '実証済みの結果', desc: '平均AI確率12.5%、50%の判定ラインを大幅に下回ります。' },
                { icon: '⚡', title: '3つの処理モード', desc: 'Standard / Gentle / Aggressiveの3モード。' },
                { icon: '🔒', title: '128k基準', desc: '128kbps CBR出力、主要プラットフォームの品質要件を満たします。' },
                { icon: '🚀', title: '超高速処理', desc: 'FFmpeg搭載、4分の楽曲を平均2.4秒で処理。' },
            ],
        },
        converter: {
            title: 'AI検出回避処理',
            sub: 'ファイルをドラッグ&ドロップ',
            guestTitle: '会員限定',
            guestDesc: '永久会員 20 USDT、TRC-20対応',
            guestLogin: 'ウォレット接続',
            guestBuy: '会員購入',
            uploadText: 'ここにファイルをドロップ',
            uploadHint: 'WAV/MP3/FLAC/M4A/OGG/AAC対応、最大100MB',
            uploadBtn: 'ファイル選択',
            modeTitle: '処理モード選択',
            modes: [
                { name: 'Standard', badge: '推奨', desc: 'Vo.24% · BG 48k · Mix 1.6:0.4', result: '平均AI 12.5%' },
                { name: 'Gentle', badge: '高音質', desc: 'Vo.30% · BG 64k · Mix 2.0:0.5', result: '最高音質' },
                { name: 'Aggressive', badge: '最強回避', desc: 'Vo.16% · BG 32k · Mix 1.0:0.3', result: '最強の回避効果' },
            ],
            convertBtn: '✨ 変換開始',
            progress: '処理中...',
            resultTitle: '完了！',
            resultDuration: '処理時間',
            resultSize: 'ファイルサイズ',
            resultFormat: 'フォーマット',
            download: '⬇️ ダウンロード',
            next: '次の曲を処理',
        },
        pricing: {
            title: 'シンプルな料金',
            sub: '一回払い、永続利用',
            badge: '🔥 人気',
            plan: '永久',
            price: '20',
            currency: 'USDT',
            period: '一回払い · 永続利用',
            features: [
                '✓ HPSSスマート処理',
                '✓ 3つの処理モード',
                '✓ 無制限変換回数',
                '✓ 128k CBR高品質出力',
                '✓ 更新不要',
                '✓ TRC-20対応',
            ],
            cta: '💎 今すぐ購入',
        },
        share: {
            title: 'vitqaをシェア',
            desc: '役に立ちましたか？必要な人と共有しましょう：',
        },
        about: {
            title: 'vitqaについて',
            p1: 'vitqaはHPSS高調波-打楽器分離技術に基づくAI音楽検出回避エンジンです。従来の「ビットレート低下」方式とは異なり、ボーカル（高調波）と背景（打楽器/楽器）を正確に分離し、背景レイヤーのみをエンコード処理します。',
            p2: '20回以上の検出テストを経たOptimized v2パイプラインは、128kbps CBR出力で平均AI確率12.5%を達成。50%の判定ラインを大きく下回ります。',
        },
        wallet: {
            modalTitle: 'ウォレット接続',
            modalDesc: 'ウォレットを接続してログイン',
            metamask: 'MetaMask',
            walletconnect: 'WalletConnect',
            signNote: '所有権確認のため署名が必要です',
        },
        payment: {
            modalTitle: '永久会員購入',
            modalDesc: '20 USDT (TRC-20) を以下のアドレスに送金',
            addressLabel: '支払いアドレス',
            copyBtn: '📋 コピー',
            network: 'TRC-20',
            currency: 'USDT',
            steps: [
                '1. MetaMaskまたはTRC-20対応ウォレットを開く',
                '2. USDTトークンを追加（TRC-20ネットワーク）',
                '3. 上記アドレスに20 USDTを送金',
                '4. トランザクションハッシュを入力して確認',
            ],
            verifyTitle: '送金しましたか？ここで確認：',
            verifyPlaceholder: 'トランザクションハッシュ',
            verifyBtn: '確認',
        },
        footer: {
            desc: 'AI音楽検出回避プラットフォーム',
            login: '会員ログイン',
            buy: '会員購入',
            features: '機能',
        },
        toast: {
            addressCopied: '✅ アドレスをコピーしました',
            linkCopied: '✅ リンクをコピーしました！',
            walletConnected: '✅ ウォレット接続完了',
            paymentSent: '⏳ 支払いを送信しました',
            paymentConfirmed: '✅ 会員が有効になりました！',
        },
    },
    'ko': {
        name: '한국어',
        flag: '🇰🇷',
        meta: {
            title: 'vitqa — AI 음성 감지 회피 | 사람 같은 음질 유지',
            description: 'vitqa는 HPSS 고조파 분리 기술 기반 AI 음악 감지 회피 플랫폼입니다. Suno/Udio AI 음악을 감지로부터 보호하세요. 평생 회원 20 USDT.',
            ogTitle: 'vitqa — AI 음악 감지 회피',
            ogDesc: 'HPSS 기반 AI 음악 감지 회피. 3가지 처리 모드, 보컬 100% 보존.',
            twitterDesc: 'HPSS 고조파 분리로 AI 음악을 인간처럼. 20 USDT 평생 회원.',
        },
        nav: {
            features: '기능',
            pricing: '가격',
            about: '정보',
            connectWallet: '지갑 연결',
            permanentMember: '★ 평생 회원',
            logout: '로그아웃',
        },
        hero: {
            badge: '⚡ HPSS v2 엔진',
            title1: 'AI 음악을',
            title2: '사람처럼 만듭니다',
            desc: 'vitqa는 HPSS 스마트 분리 기술로 AI 음악 배경 레이어를 인코딩 처리합니다.<br>보컬 품질 유지하며 AI 감지 우회.',
            ctaStart: '🚀 처리 시작',
            ctaWallet: '지갑 연결',
            statAI: '평균 AI 확률',
            statBitrate: 'CBR 출력',
            statSpeed: '평균 처리 시간',
        },
        features: {
            title: 'vitqa를 선택해야 하는 이유',
            sub: '실제 감지 환경에 최적화된 3단계 처리',
            cards: [
                { icon: '🎯', title: 'HPSS 스마트 분리', desc: '고조파-타악기 분리 알고리즘으로 보컬과 배경을 정확히 분리합니다.' },
                { icon: '🔊', title: '보컬 무손실', desc: '보컬 비율 24%, 믹스 비율 1.6:0.4로 감지를 회피하면서 음질 유지.' },
                { icon: '📊', title: '검증된 결과', desc: '평균 AI 확률 12.5%, 50% 기준선을 크게 밑돕니다.' },
                { icon: '⚡', title: '3가지 처리 모드', desc: 'Standard / Gentle / Aggressive 모드 지원.' },
                { icon: '🔒', title: '128k 기준', desc: '128kbps CBR 출력, 주요 플랫폼 품질 요구사항 충족.' },
                { icon: '🚀', title: '초고속 처리', desc: 'FFmpeg 기반, 4분 곡을 평균 2.4초에 처리.' },
            ],
        },
        converter: {
            title: 'AI 감지 회피 처리',
            sub: '드래그 앤 드롭 또는 파일 선택',
            guestTitle: '회원 전용',
            guestDesc: '평생 회원 20 USDT, TRC-20 지원',
            guestLogin: '지갑 연결',
            guestBuy: '회원 구매',
            uploadText: '오디오 파일을 여기에 드롭',
            uploadHint: 'WAV/MP3/FLAC/M4A/OGG/AAC 지원, 최대 100MB',
            uploadBtn: '파일 선택',
            modeTitle: '처리 모드 선택',
            modes: [
                { name: 'Standard', badge: '추천', desc: 'Vo.24% · BG 48k · Mix 1.6:0.4', result: '평균 AI 12.5%' },
                { name: 'Gentle', badge: '고음질', desc: 'Vo.30% · BG 64k · Mix 2.0:0.5', result: '최고 음질' },
                { name: 'Aggressive', badge: '최강 우회', desc: 'Vo.16% · BG 32k · Mix 1.0:0.3', result: '가장 강력한 우회' },
            ],
            convertBtn: '✨ 변환 시작',
            progress: '처리 중...',
            resultTitle: '완료!',
            resultDuration: '처리 시간',
            resultSize: '파일 크기',
            resultFormat: '형식',
            download: '⬇️ 다운로드',
            next: '다음 트랙 처리',
        },
        pricing: {
            title: '간단한 가격',
            sub: '일회성 결제, 평생 이용',
            badge: '🔥 인기',
            plan: '평생',
            price: '20',
            currency: 'USDT',
            period: '일회성 · 평생 이용',
            features: [
                '✓ HPSS 스마트 처리',
                '✓ 3가지 처리 모드',
                '✓ 무제한 변환',
                '✓ 128k CBR 고품질 출력',
                '✓ 갱신 불필요',
                '✓ TRC-20 지원',
            ],
            cta: '💎 지금 구매',
        },
        share: {
            title: 'vitqa 공유',
            desc: '도움이 되셨나요? 필요한 사람과 공유하세요:',
        },
        about: {
            title: 'vitqa 정보',
            p1: 'vitqa는 HPSS 고조파-타악기 분리 기술 기반 AI 음악 감지 우회 엔진입니다. 기존의 "비트레이트 낮추기" 방식과 달리 보컬과 배경을 정확히 분리하여 배경 레이어만 인코딩 처리합니다.',
            p2: '20회 이상의 테스트를 거친 Optimized v2 파이프라인은 128kbps CBR 출력에서 평균 AI 확률 12.5%를 달성했습니다.',
        },
        wallet: {
            modalTitle: '지갑 연결',
            modalDesc: '지갑을 연결하여 로그인',
            metamask: 'MetaMask',
            walletconnect: 'WalletConnect',
            signNote: '소유권 확인을 위해 서명이 필요합니다',
        },
        payment: {
            modalTitle: '평생 회원 구매',
            modalDesc: '20 USDT (TRC-20)를 아래 주소로 보내기',
            addressLabel: '결제 주소',
            copyBtn: '📋 복사',
            network: 'TRC-20',
            currency: 'USDT',
            steps: [
                '1. MetaMask 또는 TRC-20 지원 지갑 열기',
                '2. USDT 토큰 추가 (TRC-20 네트워크)',
                '3. 위 주소로 20 USDT 보내기',
                '4. 트랜잭션 해시 입력하여 확인',
            ],
            verifyTitle: '보내셨나요? 여기서 확인:',
            verifyPlaceholder: '트랜잭션 해시',
            verifyBtn: '확인',
        },
        footer: {
            desc: 'AI 음악 감지 우회 플랫폼',
            login: '회원 로그인',
            buy: '회원 구매',
            features: '기능',
        },
        toast: {
            addressCopied: '✅ 주소가 복사되었습니다',
            linkCopied: '✅ 링크가 복사되었습니다!',
            walletConnected: '✅ 지갑 연결됨',
            paymentSent: '⏳ 결제 제출됨, 확인 대기 중',
            paymentConfirmed: '✅ 회원이 활성화되었습니다!',
        },
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
    try {
        return localStorage.getItem('vitqa_lang') || getBrowserLang();
    } catch(e) { return 'zh-CN'; }
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

    // Update HTML lang
    document.documentElement.lang = lang;

    // Update meta tags
    if (data.meta) {
        document.title = data.meta.title || document.title;
        updateMeta('description', data.meta.description);
        updateMeta('og:title', data.meta.ogTitle);
        updateMeta('og:description', data.meta.ogDesc);
        updateMeta('twitter:description', data.meta.twitterDesc);
        updateMeta('twitter:title', data.meta.ogTitle);
    }

    // Update elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = t(key);
        if (text && typeof text === 'string') {
            el.innerHTML = text;
        }
    });

    // Update language switcher
    const sw = document.getElementById('langSwitcher');
    if (sw) {
        sw.innerHTML = Object.entries(LANGUAGES).map(([code, l]) =>
            `<div class="lang-option ${code === lang ? 'active' : ''}" data-lang="${code}" onclick="setLang('${code}')">${l.flag} ${l.name}</div>`
        ).join('');
    }
    const swBtn = document.getElementById('langBtn');
    if (swBtn) {
        swBtn.innerHTML = `${data.flag} ${data.name} <span class="lang-arrow">▾</span>`;
    }
}

function updateMeta(name, content) {
    if (!content) return;
    let el = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
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
    // Close dropdown
    const dd = document.getElementById('langDropdown');
    if (dd) dd.classList.add('hidden');
}

// Also update title and run immediately + on DOM ready
applyLang();
document.addEventListener('DOMContentLoaded', function() {
    applyLang();
    // Re-apply after a short delay for dynamic content
    setTimeout(applyLang, 100);
});

// Close language dropdown when clicking outside
document.addEventListener('click', function(e) {
    const wrap = document.getElementById('langSwitcherWrap');
    const dd = document.getElementById('langDropdown');
    if (wrap && dd && !wrap.contains(e.target)) {
        dd.classList.add('hidden');
    }
});

console.log('vitqa i18n loaded - lang:', getSavedLang());
