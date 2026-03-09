// =============================================
// CG PRODUCTION DEPARTMENT — Staff & Data
// 5-person team: CEO, CG Lead, 2x 3D Artist, AI Gen
// =============================================

export const employees = [
  {
    id: 'cong',
    name: 'Công',
    role: 'CEO',
    avatar: '👔',
    skills: ['Project Strategy', 'Client Relations', 'Budget Management'],
    status: 'working',
    color: '#8B5CF6',
    personality: 'strategic, decisive, big-picture thinker',
  },
  {
    id: 'quan',
    name: 'Quân',
    role: 'CG Lead',
    avatar: '🎬',
    skills: ['3D Supervision', 'Quality Review', 'Pipeline Management'],
    status: 'reviewing',
    color: '#06B6D4',
    personality: 'detail-oriented, experienced, mentoring',
  },
  {
    id: 'son',
    name: 'Sơn',
    role: '3D Artist',
    avatar: '🎨',
    skills: ['Modeling', 'Texturing', 'Lighting'],
    status: 'working',
    color: '#10B981',
    personality: 'creative, focused, perfectionist',
  },
  {
    id: 'thinh',
    name: 'Thịnh',
    role: '3D Artist',
    avatar: '✨',
    skills: ['Animation', 'Rigging', 'Rendering'],
    status: 'working',
    color: '#F59E0B',
    personality: 'energetic, innovative, fast learner',
  },
  {
    id: 'kiet',
    name: 'Kiệt',
    role: 'Bảo vệ',
    avatar: '👮',
    skills: ['Security', 'Patrolling', 'Access Control'],
    status: 'patrolling',
    color: '#EC4899',
    personality: 'alert, friendly, reliable',
  },
];

export const statusLabels = {
  working: { label: 'Đang làm', color: '#10B981', icon: '💼' },
  coding: { label: 'Gen AI', color: '#06B6D4', icon: '🤖' },
  reviewing: { label: 'Review', color: '#F59E0B', icon: '🔍' },
  meeting: { label: 'Họp', color: '#8B5CF6', icon: '📹' },
  break: { label: 'Nghỉ', color: '#6B7280', icon: '☕' },
  thinking: { label: 'Suy nghĩ...', color: '#EC4899', icon: '🧠' },
  rendering: { label: 'Rendering', color: '#EF4444', icon: '🖥️' },
  patrolling: { label: 'Tuần tra', color: '#3B82F6', icon: '🔦' },
};

export const chatTemplates = {
  'CEO': [
    "Tuần này ta cần hoàn thành bộ asset cho client Dragon Corp. Deadline thứ 6.",
    "Tôi vừa review portfolio mới. Quân xem qua chất lượng giúp tôi nhé.",
    "Budget tháng này tăng 15%. Ta có thể thuê thêm render farm.",
    "Client gửi feedback rồi. Cần chỉnh lại lighting scene 3.",
    "Đã approve concept art. Sơn và Thịnh bắt đầu modeling được rồi.",
    "Meeting với client lúc 3h chiều. Quân chuẩn bị bản preview nhé.",
    "KPI tháng này tốt. Team hoàn thành 92% deadline đúng hạn.",
    "Tôi cần bản demo cho investor vào thứ 4. Ưu tiên project Alpha.",
  ],
  'CG Lead': [
    "Sơn ơi, topology mesh character cần optimize lại, poly count cao quá.",
    "Thịnh check lại rig tay nhân vật chính, IK chain bị lỗi rồi.",
    "Anh em nhớ backup file trước khi đẩy lên NAS nhé.",
    "Review xong batch render. Scene 5 cần chỉnh lại global illumination.",
    "Pipeline update: chuyển sang Linear workflow cho tất cả project mới.",
    "Đã setup render farm cho project Dragon Corp. ETA: 8 tiếng.",
    "Quality check passed cho 15/18 assets. 3 cái cần revise topology.",
    "Shading pass đã xong. Bắt đầu comp lighting cho scene chính.",
  ],
  '3D Artist': [
    "Modeling character xong rồi. 12k poly, clean topology. Gửi review nhé.",
    "Đang retopo từ sculpt sang low-poly. Khoảng 2 tiếng nữa xong.",
    "UV unwrap hoàn tất. Bắt đầu texturing trong Substance Painter.",
    "Render test cho scene mới. Lighting cần warm hơn một chút.",
    "Animation walk cycle xong 24 frames. Smooth transitions.",
    "Rig facial expressions xong 12 blend shapes. Testing bây giờ.",
    "Baking normal map xong. Quality check ổn, không có seam artifacts.",
    "Export FBX cho game engine. Đã test import Unity thành công.",
    "Sculpt xong boss character. Polycount: 2.5M. Bắt đầu retopo.",
    "Particle system cho magic effects đã setup. 60fps stable.",
  ],
  'Bảo vệ': [
    "Mọi người nhớ khóa cửa cẩn thận khi ra về nhé.",
    "Anh Công ơi, nay có người giao bưu phẩm từ khách hàng.",
    "Kiểm tra an ninh tầng 3: Mọi thứ an toàn.",
    "Đã bật hệ thống camera giám sát ngoài hành lang.",
    "Sơn có ở lại OT không để chú chốt số lượng đặt cơm đêm?",
    "Đèn phòng họp quên tắt, tôi vừa lên tắt rồi nhé.",
    "Chìa khóa phòng server đã được bàn giao cho Quân.",
    "Mọi người để xe gọn gàng vào bãi nhé, dạo này đông.",
  ],
};

export const taskTemplates = [
  // CEO tasks
  { title: 'Duyệt concept art Project Alpha', priority: 'high', category: 'Review', defaultAssignee: 'cong' },
  { title: 'Chuẩn bị presentation cho investor', priority: 'high', category: 'Business', defaultAssignee: 'cong' },
  { title: 'Review budget render farm Q2', priority: 'medium', category: 'Business', defaultAssignee: 'cong' },

  // CG Lead tasks
  { title: 'Review topology batch assets', priority: 'high', category: 'QA', defaultAssignee: 'quan' },
  { title: 'Setup lighting rig scene chính', priority: 'high', category: '3D', defaultAssignee: 'quan' },
  { title: 'Optimize render pipeline', priority: 'medium', category: 'Pipeline', defaultAssignee: 'quan' },
  { title: 'Quality check character textures', priority: 'high', category: 'QA', defaultAssignee: 'quan' },

  // 3D Artist tasks
  { title: 'Model hero character (low-poly)', priority: 'high', category: '3D', defaultAssignee: 'son' },
  { title: 'Texture environment props set A', priority: 'medium', category: '3D', defaultAssignee: 'son' },
  { title: 'UV unwrap vehicle assets', priority: 'medium', category: '3D', defaultAssignee: 'son' },
  { title: 'Sculpt boss character detail', priority: 'high', category: '3D', defaultAssignee: 'son' },
  { title: 'Rig character cho animation', priority: 'high', category: '3D', defaultAssignee: 'thinh' },
  { title: 'Animate walk cycle NPC', priority: 'medium', category: 'Animation', defaultAssignee: 'thinh' },
  { title: 'Render final scene 1-5', priority: 'high', category: 'Render', defaultAssignee: 'thinh' },
  { title: 'Setup particle effects magic', priority: 'medium', category: 'VFX', defaultAssignee: 'thinh' },
  { title: 'Bake normal maps batch props', priority: 'medium', category: '3D', defaultAssignee: 'son' },

  // Bảo vệ tasks
  { title: 'Tuần tra an ninh văn phòng', priority: 'high', category: 'Security', defaultAssignee: 'kiet' },
  { title: 'Kiểm tra hệ thống PCCC tầng 3', priority: 'medium', category: 'Security', defaultAssignee: 'kiet' },
  { title: 'Mở cửa phòng họp cho đối tác', priority: 'medium', category: 'Facilities', defaultAssignee: 'kiet' },
  { title: 'Chốt danh sách gửi xe tháng này', priority: 'low', category: 'Admin', defaultAssignee: 'kiet' },
  { title: 'Bật hệ thống camera đêm', priority: 'high', category: 'Security', defaultAssignee: 'kiet' },
];

export const meetingTopics = [
  { title: 'Daily Standup', duration: '15 min', type: 'standup' },
  { title: 'Weekly Sprint Review', duration: '30 min', type: 'review' },
  { title: 'Art Direction Meeting', duration: '45 min', type: 'design' },
  { title: 'Client Feedback Review', duration: '30 min', type: 'review' },
  { title: 'Pipeline Optimization', duration: '20 min', type: 'planning' },
  { title: 'Render Farm Setup', duration: '15 min', type: 'planning' },
  { title: 'Weekly Retrospective', duration: '30 min', type: 'retro' },
];

export const terminalLogTemplates = [
  {
    level: 'INFO', messages: [
      'Render job started: scene_{count}.blend [GPU: RTX 4090]',
      'Texture batch processing: {count}/500 completed',
      'Asset export pipeline: {count} files processed',
      'LoRA training epoch {count}/100 — loss: 0.{p99}',
      'Blender subprocess active: {active} instances',
      'GPU memory usage: {mem}MB / 24576MB ({pct}%)',
      'Stable Diffusion batch: {count} images queued',
      'FBX validation passed for {count} assets',
      'Render farm node status: {active}/8 active',
      'ComfyUI workflow: step {count}/{p99} completed',
    ]
  },
  {
    level: 'WARN', messages: [
      'High VRAM usage on GPU-0: {pct}%',
      'Render job ETA exceeded estimate by {time} minutes',
      'Texture resolution exceeds 4K limit: asset_{count}.png',
      'Poly count warning: mesh exceeds {count}k triangles',
      'Disk space low on render output: {pct}% used',
      'LoRA training: gradient exploding at epoch {count}',
    ]
  },
  {
    level: 'SUCCESS', messages: [
      'Render complete: scene_{count}.exr (output: 4K, {time}s)',
      'All texture bakes passed quality check ({count}/{count})',
      'LoRA model v{active} saved — accuracy: {pct}%',
      'Asset pack exported: {count} files, {mem}MB total',
      'Animation cache built successfully ({count} frames)',
      'Client delivery package uploaded (scene 1-{active})',
    ]
  },
  {
    level: 'ERROR', messages: [
      'Render failed: CUDA out of memory on gpu-node-{active}',
      'Blender crash: segfault in physics simulation',
      'SD pipeline error: invalid LoRA weights checkpoint',
    ]
  },
];
