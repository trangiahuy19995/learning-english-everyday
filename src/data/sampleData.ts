import { newProgress } from '@/domain/srsEngine'
import type { Deck, Example, Phrase, Synonym } from '@/domain/types'
import { EXTRA_DECKS, EXTRA_SEEDS } from './extraData'

const T0 = Date.UTC(2025, 0, 1)

/** Bump when new built-in decks/phrases are added so existing users receive them. */
export const SEED_VERSION = 2

export const SAMPLE_DECKS: Deck[] = [
  { id: 'deck-giao-tiep', name: 'Giao tiếp', color: 'green', description: 'Cụm từ dùng hằng ngày với bạn bè, người quen.', createdAt: T0 },
  { id: 'deck-cong-so', name: 'Công sở', color: 'blue', description: 'Họp hành, email, làm việc nhóm.', createdAt: T0 },
  { id: 'deck-du-lich', name: 'Du lịch', color: 'orange', description: 'Đi lại, khám phá, nghỉ dưỡng.', createdAt: T0 },
  { id: 'deck-ielts', name: 'IELTS', color: 'purple', description: 'Collocation học thuật cho Writing & Speaking.', createdAt: T0 },
  ...EXTRA_DECKS,
]

type Seed = {
  id: string
  phrase: string
  ipa: string
  meaning_vi: string
  nuance_vi?: string
  synonyms: Synonym[]
  examples: Example[]
  topic: string
}

const seeds: Seed[] = [
  // Giao tiếp
  {
    id: 'ph-rain-check',
    phrase: 'take a rain check',
    ipa: '/teɪk ə ˈreɪn tʃek/',
    meaning_vi: 'hẹn dịp khác, khất lời mời',
    nuance_vi: 'Thân mật; từ chối khéo nhưng vẫn muốn nhận lời vào lần sau.',
    synonyms: [
      { text: 'postpone', note_vi: 'trang trọng hơn, dùng cho sự kiện' },
      { text: 'maybe another time', note_vi: 'câu nói tự nhiên, nhẹ nhàng' },
    ],
    examples: [
      { en: "I'm exhausted tonight. Can I take a rain check on dinner?", vi: 'Tối nay mình mệt quá. Để bữa tối hôm khác nhé?', highlight: 'take a rain check' },
      { en: 'She took a rain check on the movie because of her exam.', vi: 'Cô ấy hẹn xem phim dịp khác vì phải thi.', highlight: 'took a rain check' },
    ],
    topic: 'deck-giao-tiep',
  },
  {
    id: 'ph-meet-halfway',
    phrase: 'meet halfway',
    ipa: '/miːt ˌhɑːfˈweɪ/',
    meaning_vi: 'nhượng bộ lẫn nhau, mỗi bên lùi một bước',
    nuance_vi: 'Dùng trong thương lượng, cả công việc lẫn đời sống.',
    synonyms: [
      { text: 'compromise', note_vi: 'từ đơn, trung tính' },
      { text: 'find a middle ground', note_vi: 'nhấn mạnh việc tìm điểm chung' },
    ],
    examples: [
      { en: "You want 100 dollars and I offer 60. Let's meet halfway at 80.", vi: 'Anh muốn 100 đô còn tôi trả 60. Mình mỗi bên lùi một bước, 80 nhé.', highlight: 'meet halfway' },
      { en: 'If we both met halfway, the argument would end.', vi: 'Nếu cả hai cùng nhường nhau một chút, cuộc cãi vã sẽ kết thúc.', highlight: 'met halfway' },
    ],
    topic: 'deck-giao-tiep',
  },
  {
    id: 'ph-break-ice',
    phrase: 'break the ice',
    ipa: '/breɪk ðə aɪs/',
    meaning_vi: 'phá vỡ bầu không khí ngại ngùng ban đầu',
    nuance_vi: 'Dùng khi mới gặp nhau, trong buổi tiệc hoặc buổi họp đầu tiên.',
    synonyms: [
      { text: 'warm up the room', note_vi: 'làm không khí sôi nổi hơn' },
      { text: 'start a conversation', note_vi: 'nghĩa đen hơn, ít hình ảnh' },
    ],
    examples: [
      { en: 'He told a funny story to break the ice.', vi: 'Anh ấy kể một câu chuyện vui để phá tan sự ngại ngùng.', highlight: 'break the ice' },
      { en: 'A quick game broke the ice at the start of the workshop.', vi: 'Một trò chơi nhanh đã làm không khí đầu buổi hội thảo bớt gượng gạo.', highlight: 'broke the ice' },
    ],
    topic: 'deck-giao-tiep',
  },
  {
    id: 'ph-hit-it-off',
    phrase: 'hit it off',
    ipa: '/hɪt ɪt ɒf/',
    meaning_vi: 'hợp nhau ngay từ lần đầu gặp',
    nuance_vi: 'Thân mật; thường dùng ở thì quá khứ để kể lại.',
    synonyms: [
      { text: 'get along well', note_vi: 'hợp nhau nói chung, không nhất thiết ngay lập tức' },
      { text: 'click', note_vi: 'rất khẩu ngữ' },
    ],
    examples: [
      { en: 'My sister and her new roommate hit it off immediately.', vi: 'Chị tôi và bạn cùng phòng mới hợp nhau ngay lập tức.', highlight: 'hit it off' },
      { en: "I'm sure you two will hit it off.", vi: 'Mình chắc hai bạn sẽ hợp nhau lắm.', highlight: 'hit it off' },
    ],
    topic: 'deck-giao-tiep',
  },
  {
    id: 'ph-keep-in-touch',
    phrase: 'keep in touch',
    ipa: '/kiːp ɪn tʌtʃ/',
    meaning_vi: 'giữ liên lạc',
    nuance_vi: 'Hay dùng khi chia tay, kết thư.',
    synonyms: [
      { text: 'stay in contact', note_vi: 'trang trọng hơn một chút' },
      { text: 'keep up with', note_vi: 'theo dõi tin tức của ai đó' },
    ],
    examples: [
      { en: "It was great working with you. Let's keep in touch!", vi: 'Làm việc với bạn rất vui. Mình giữ liên lạc nhé!', highlight: 'keep in touch' },
      { en: 'We have kept in touch since high school.', vi: 'Chúng tôi vẫn giữ liên lạc từ hồi cấp ba.', highlight: 'kept in touch' },
    ],
    topic: 'deck-giao-tiep',
  },
  // Công sở
  {
    id: 'ph-touch-base',
    phrase: 'touch base',
    ipa: '/tʌtʃ beɪs/',
    meaning_vi: 'trao đổi nhanh, cập nhật tình hình với ai',
    nuance_vi: 'Văn phong công sở, thường trong email và cuộc họp ngắn.',
    synonyms: [
      { text: 'check in', note_vi: 'hỏi thăm tiến độ, thân mật hơn' },
      { text: 'catch up', note_vi: 'trò chuyện cập nhật, dùng cả ngoài công việc' },
    ],
    examples: [
      { en: "Let's touch base on Friday to review the numbers.", vi: 'Thứ Sáu mình trao đổi nhanh để rà lại số liệu nhé.', highlight: 'touch base' },
      { en: 'I touched base with the client this morning.', vi: 'Sáng nay tôi đã liên hệ cập nhật với khách hàng.', highlight: 'touched base' },
    ],
    topic: 'deck-cong-so',
  },
  {
    id: 'ph-ball-rolling',
    phrase: 'get the ball rolling',
    ipa: '/ɡet ðə bɔːl ˈrəʊlɪŋ/',
    meaning_vi: 'bắt đầu, khởi động một việc',
    nuance_vi: 'Thân thiện, hay dùng khi mở đầu cuộc họp hoặc dự án.',
    synonyms: [
      { text: 'kick off', note_vi: 'khởi động chính thức' },
      { text: 'get started', note_vi: 'trung tính, phổ biến' },
    ],
    examples: [
      { en: "To get the ball rolling, let's hear everyone's ideas.", vi: 'Để bắt đầu, mình nghe ý tưởng của mọi người nhé.', highlight: 'get the ball rolling' },
      { en: 'Our manager got the ball rolling with a short introduction.', vi: 'Quản lý của chúng tôi mở đầu bằng một phần giới thiệu ngắn.', highlight: 'got the ball rolling' },
    ],
    topic: 'deck-cong-so',
  },
  {
    id: 'ph-same-page',
    phrase: 'on the same page',
    ipa: '/ɒn ðə seɪm peɪdʒ/',
    meaning_vi: 'cùng hiểu, thống nhất quan điểm',
    nuance_vi: 'Phổ biến trong làm việc nhóm; thường đi với "be" hoặc "get".',
    synonyms: [
      { text: 'in agreement', note_vi: 'trang trọng hơn' },
      { text: 'aligned', note_vi: 'văn phong doanh nghiệp' },
    ],
    examples: [
      { en: 'Before we launch, I want to make sure we are on the same page.', vi: 'Trước khi ra mắt, tôi muốn chắc rằng chúng ta đã thống nhất.', highlight: 'on the same page' },
      { en: 'The designers and developers were not on the same page.', vi: 'Nhóm thiết kế và lập trình chưa hiểu ý nhau.', highlight: 'on the same page' },
    ],
    topic: 'deck-cong-so',
  },
  {
    id: 'ph-call-it-a-day',
    phrase: 'call it a day',
    ipa: '/kɔːl ɪt ə deɪ/',
    meaning_vi: 'nghỉ tay, kết thúc công việc hôm nay',
    nuance_vi: 'Thân mật; cũng dùng với nghĩa dừng hẳn một việc lâu dài.',
    synonyms: [
      { text: 'wrap up', note_vi: 'hoàn tất, kết thúc phần việc' },
      { text: 'knock off', note_vi: 'Anh–Anh, rất khẩu ngữ' },
    ],
    examples: [
      { en: "It's almost seven. Let's call it a day.", vi: 'Gần bảy giờ rồi. Mình nghỉ thôi.', highlight: 'call it a day' },
      { en: 'After 30 years in teaching, she decided to call it a day.', vi: 'Sau 30 năm dạy học, bà quyết định nghỉ hưu.', highlight: 'call it a day' },
    ],
    topic: 'deck-cong-so',
  },
  {
    id: 'ph-behind-schedule',
    phrase: 'behind schedule',
    ipa: '/bɪˈhaɪnd ˈʃedjuːl/',
    meaning_vi: 'chậm tiến độ, trễ so với kế hoạch',
    nuance_vi: 'Trung tính; trái nghĩa là "ahead of schedule".',
    synonyms: [
      { text: 'running late', note_vi: 'khẩu ngữ, cũng dùng cho người đến muộn' },
      { text: 'overdue', note_vi: 'đã quá hạn' },
    ],
    examples: [
      { en: 'The construction project is three weeks behind schedule.', vi: 'Dự án xây dựng đang chậm ba tuần so với kế hoạch.', highlight: 'behind schedule' },
      { en: 'We fell behind schedule because of the holiday.', vi: 'Chúng tôi bị trễ tiến độ vì kỳ nghỉ lễ.', highlight: 'behind schedule' },
    ],
    topic: 'deck-cong-so',
  },
  // Du lịch
  {
    id: 'ph-beaten-track',
    phrase: 'off the beaten track',
    ipa: '/ɒf ðə ˈbiːtn træk/',
    meaning_vi: 'nơi hẻo lánh, ít khách du lịch',
    nuance_vi: 'Mang sắc thái tích cực: hoang sơ, đáng khám phá. Mỹ thường nói "off the beaten path".',
    synonyms: [
      { text: 'remote', note_vi: 'xa xôi, trung tính' },
      { text: 'hidden gem', note_vi: 'nơi tuyệt vời ít người biết' },
    ],
    examples: [
      { en: 'We stayed in a small village off the beaten track.', vi: 'Chúng tôi ở một ngôi làng nhỏ hẻo lánh, ít khách du lịch.', highlight: 'off the beaten track' },
      { en: 'If you like quiet places, go off the beaten track.', vi: 'Nếu bạn thích chỗ yên tĩnh, hãy đến những nơi ít người biết.', highlight: 'off the beaten track' },
    ],
    topic: 'deck-du-lich',
  },
  {
    id: 'ph-travel-light',
    phrase: 'travel light',
    ipa: '/ˈtrævl laɪt/',
    meaning_vi: 'đi du lịch gọn nhẹ, mang ít hành lý',
    synonyms: [
      { text: 'pack light', note_vi: 'nhấn vào việc soạn đồ' },
      { text: 'carry-on only', note_vi: 'chỉ mang hành lý xách tay' },
    ],
    examples: [
      { en: 'I always travel light, with just a backpack.', vi: 'Tôi luôn đi gọn nhẹ, chỉ với một chiếc ba lô.', highlight: 'travel light' },
      { en: 'Travelling light saves you baggage fees.', vi: 'Mang ít hành lý giúp bạn tiết kiệm phí ký gửi.', highlight: 'Travelling light' },
    ],
    topic: 'deck-du-lich',
  },
  {
    id: 'ph-catch-flight',
    phrase: 'catch a flight',
    ipa: '/kætʃ ə flaɪt/',
    meaning_vi: 'đi chuyến bay, kịp lên máy bay',
    nuance_vi: 'Khẩu ngữ; "catch" ngụ ý phải đúng giờ.',
    synonyms: [
      { text: 'board a plane', note_vi: 'trang trọng, nhấn vào hành động lên máy bay' },
      { text: 'take a flight', note_vi: 'trung tính' },
    ],
    examples: [
      { en: 'Sorry, I have to go. I need to catch a flight at six.', vi: 'Xin lỗi, tôi phải đi đây. Tôi phải đi chuyến bay lúc sáu giờ.', highlight: 'catch a flight' },
      { en: 'We caught an early flight to Da Nang.', vi: 'Chúng tôi đi chuyến bay sớm ra Đà Nẵng.', highlight: 'caught an early flight' },
    ],
    topic: 'deck-du-lich',
  },
  {
    id: 'ph-get-away',
    phrase: 'get away from it all',
    ipa: '/ɡet əˈweɪ frəm ɪt ɔːl/',
    meaning_vi: 'thoát khỏi bộn bề, đi nghỉ cho thư thái',
    nuance_vi: 'Hay dùng trong quảng cáo du lịch.',
    synonyms: [
      { text: 'unwind', note_vi: 'thư giãn, xả stress' },
      { text: 'take a break', note_vi: 'nghỉ ngơi ngắn, trung tính' },
    ],
    examples: [
      { en: 'This island is the perfect place to get away from it all.', vi: 'Hòn đảo này là nơi lý tưởng để thoát khỏi mọi bộn bề.', highlight: 'get away from it all' },
      { en: 'Every summer we rent a cabin to get away from it all.', vi: 'Mùa hè nào chúng tôi cũng thuê một căn nhà gỗ để nghỉ ngơi cho thư thái.', highlight: 'get away from it all' },
    ],
    topic: 'deck-du-lich',
  },
  {
    id: 'ph-hit-road',
    phrase: 'hit the road',
    ipa: '/hɪt ðə rəʊd/',
    meaning_vi: 'lên đường, khởi hành',
    nuance_vi: 'Thân mật; cũng có nghĩa "đi về thôi".',
    synonyms: [
      { text: 'set off', note_vi: 'bắt đầu chuyến đi, trung tính' },
      { text: 'head out', note_vi: 'ra ngoài, rời đi' },
    ],
    examples: [
      { en: "We should hit the road early to avoid traffic.", vi: 'Chúng ta nên khởi hành sớm để tránh kẹt xe.', highlight: 'hit the road' },
      { en: "It's getting late. I'd better hit the road.", vi: 'Muộn rồi. Tôi về đây.', highlight: 'hit the road' },
    ],
    topic: 'deck-du-lich',
  },
  // IELTS
  {
    id: 'ph-key-role',
    phrase: 'play a key role in',
    ipa: '/pleɪ ə kiː rəʊl ɪn/',
    meaning_vi: 'đóng vai trò then chốt trong',
    nuance_vi: 'Học thuật; theo sau là danh từ hoặc V-ing.',
    synonyms: [
      { text: 'be instrumental in', note_vi: 'trang trọng, nhấn mạnh sự góp phần' },
      { text: 'be central to', note_vi: 'là trọng tâm của' },
    ],
    examples: [
      { en: 'Teachers play a key role in shaping young minds.', vi: 'Giáo viên đóng vai trò then chốt trong việc định hình tư duy của người trẻ.', highlight: 'play a key role in' },
      { en: 'Technology has played a key role in modern healthcare.', vi: 'Công nghệ đã đóng vai trò then chốt trong y tế hiện đại.', highlight: 'played a key role in' },
    ],
    topic: 'deck-ielts',
  },
  {
    id: 'ph-double-edged',
    phrase: 'a double-edged sword',
    ipa: '/ə ˌdʌbl ˈedʒd sɔːd/',
    meaning_vi: 'con dao hai lưỡi',
    nuance_vi: 'Dùng tốt trong bài luận về ưu – nhược điểm.',
    synonyms: [
      { text: 'a mixed blessing', note_vi: 'vừa có lợi vừa có hại, nhẹ nhàng hơn' },
      { text: 'a trade-off', note_vi: 'sự đánh đổi' },
    ],
    examples: [
      { en: 'Social media is a double-edged sword for teenagers.', vi: 'Mạng xã hội là con dao hai lưỡi đối với thanh thiếu niên.', highlight: 'a double-edged sword' },
      { en: 'Fame can be a double-edged sword.', vi: 'Sự nổi tiếng có thể là con dao hai lưỡi.', highlight: 'a double-edged sword' },
    ],
    topic: 'deck-ielts',
  },
  {
    id: 'ph-raise-awareness',
    phrase: 'raise awareness of',
    ipa: '/reɪz əˈweənəs əv/',
    meaning_vi: 'nâng cao nhận thức về',
    nuance_vi: 'Collocation học thuật; cũng gặp "raise awareness about".',
    synonyms: [
      { text: 'draw attention to', note_vi: 'thu hút sự chú ý' },
      { text: 'highlight', note_vi: 'làm nổi bật vấn đề' },
    ],
    examples: [
      { en: 'The campaign aims to raise awareness of plastic pollution.', vi: 'Chiến dịch nhằm nâng cao nhận thức về ô nhiễm nhựa.', highlight: 'raise awareness of' },
      { en: 'Schools should raise awareness of mental health.', vi: 'Trường học nên nâng cao nhận thức về sức khỏe tinh thần.', highlight: 'raise awareness of' },
    ],
    topic: 'deck-ielts',
  },
  {
    id: 'ph-take-into-account',
    phrase: 'take into account',
    ipa: '/teɪk ˈɪntə əˈkaʊnt/',
    meaning_vi: 'cân nhắc, tính đến',
    nuance_vi: 'Có thể tách: "take something into account".',
    synonyms: [
      { text: 'consider', note_vi: 'từ đơn, trung tính' },
      { text: 'bear in mind', note_vi: 'ghi nhớ, lưu ý' },
    ],
    examples: [
      { en: 'Governments must take into account the needs of the elderly.', vi: 'Chính phủ phải tính đến nhu cầu của người cao tuổi.', highlight: 'take into account' },
      { en: 'Cost was not taken into account when planning the event.', vi: 'Chi phí đã không được tính đến khi lên kế hoạch sự kiện.', highlight: 'taken into account' },
    ],
    topic: 'deck-ielts',
  },
  {
    id: 'ph-significant-impact',
    phrase: 'have a significant impact on',
    ipa: '/hæv ə sɪɡˈnɪfɪkənt ˈɪmpækt ɒn/',
    meaning_vi: 'có tác động đáng kể đến',
    nuance_vi: 'Học thuật; có thể thay "significant" bằng "profound", "considerable".',
    synonyms: [
      { text: 'greatly affect', note_vi: 'ảnh hưởng lớn, ngắn gọn hơn' },
      { text: 'have a profound effect on', note_vi: 'nhấn mạnh mức độ sâu sắc' },
    ],
    examples: [
      { en: 'Climate change will have a significant impact on agriculture.', vi: 'Biến đổi khí hậu sẽ có tác động đáng kể đến nông nghiệp.', highlight: 'have a significant impact on' },
      { en: 'The new policy has had a significant impact on small businesses.', vi: 'Chính sách mới đã có tác động đáng kể đến các doanh nghiệp nhỏ.', highlight: 'had a significant impact on' },
    ],
    topic: 'deck-ielts',
  },
]

export function createSamplePhrases(): Phrase[] {
  return [...seeds, ...EXTRA_SEEDS].map((s) => ({ ...s, starred: false, progress: newProgress(), createdAt: T0, updatedAt: T0 }))
}
