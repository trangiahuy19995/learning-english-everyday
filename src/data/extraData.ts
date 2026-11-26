import type { Deck, Example, Synonym } from '@/domain/types'

const T1 = Date.UTC(2025, 1, 1)

export const EXTRA_DECKS: Deck[] = [
  { id: 'deck-phrasal', name: 'Phrasal verbs', color: 'teal', description: 'Cụm động từ thông dụng nhất trong giao tiếp.', createdAt: T1 },
  { id: 'deck-idioms', name: 'Thành ngữ', color: 'pink', description: 'Idiom giàu hình ảnh, nghe tự nhiên như người bản xứ.', createdAt: T1 },
  { id: 'deck-cam-xuc', name: 'Cảm xúc', color: 'orange', description: 'Diễn tả vui, buồn, giận, lo lắng.', createdAt: T1 },
  { id: 'deck-tien-bac', name: 'Tiền bạc & Mua sắm', color: 'green', description: 'Chi tiêu, tiết kiệm, mặc cả.', createdAt: T1 },
  { id: 'deck-suc-khoe', name: 'Sức khỏe', color: 'blue', description: 'Luyện tập, ăn uống, nghỉ ngơi.', createdAt: T1 },
  { id: 'deck-hoc-tap', name: 'Học tập', color: 'purple', description: 'Trường lớp, thi cử, tự học.', createdAt: T1 },
]

export type ExtraSeed = {
  id: string
  phrase: string
  ipa: string
  meaning_vi: string
  nuance_vi?: string
  synonyms: Synonym[]
  examples: Example[]
  topic: string
}

type Row = [
  id: string,
  phrase: string,
  ipa: string,
  meaning: string,
  nuance: string,
  synonyms: [string, string][],
  examples: [en: string, vi: string, highlight: string][],
]

const deck = (topic: string, rows: Row[]): ExtraSeed[] =>
  rows.map(([id, phrase, ipa, meaning_vi, nuance_vi, syn, ex]) => ({
    id: `ph-${id}`,
    phrase,
    ipa,
    meaning_vi,
    nuance_vi,
    synonyms: syn.map(([text, note_vi]) => ({ text, note_vi })),
    examples: ex.map(([en, vi, highlight]) => ({ en, vi, highlight })),
    topic,
  }))

export const EXTRA_SEEDS: ExtraSeed[] = [
  ...deck('deck-giao-tiep', [
    ['small-talk', 'make small talk', '/meɪk smɔːl tɔːk/', 'nói chuyện xã giao, tán gẫu', 'Chuyện nhẹ nhàng như thời tiết, cuối tuần.', [['chat', 'trò chuyện thân mật'], ['chit-chat', 'rất khẩu ngữ']], [
      ['We made small talk while waiting for the bus.', 'Chúng tôi nói chuyện phiếm trong lúc đợi xe buýt.', 'made small talk'],
      ["I'm not good at making small talk with strangers.", 'Tôi không giỏi nói chuyện xã giao với người lạ.', 'making small talk'],
    ]],
    ['drop-by', 'drop by', '/drɒp baɪ/', 'ghé qua (không báo trước)', 'Thân mật; cũng nói "drop in".', [['stop by', 'gần như đồng nghĩa'], ['pop in', 'rất khẩu ngữ, ghé nhanh']], [
      ['Feel free to drop by anytime.', 'Cứ ghé chơi bất cứ lúc nào nhé.', 'drop by'],
      ['My aunt dropped by with a cake yesterday.', 'Hôm qua dì tôi ghé qua mang theo một cái bánh.', 'dropped by'],
    ]],
    ['catch-up-with', 'catch up with', '/kætʃ ʌp wɪð/', 'gặp lại để trò chuyện, cập nhật tin tức', 'Dùng với bạn cũ, người lâu không gặp.', [['reconnect with', 'nối lại liên lạc'], ['get together with', 'tụ tập']], [
      ["Let's grab coffee and catch up with each other.", 'Đi cà phê rồi kể chuyện cho nhau nghe nhé.', 'catch up with'],
      ['I caught up with an old classmate last weekend.', 'Cuối tuần trước tôi gặp lại một bạn học cũ.', 'caught up with'],
    ]],
    ['up-to-you', "it's up to you", '/ɪts ʌp tə juː/', 'tùy bạn quyết định', 'Trao quyền lựa chọn cho người kia.', [['your call', 'khẩu ngữ, bạn quyết'], ['whatever you prefer', 'lịch sự hơn']], [
      ["Pizza or sushi? It's up to you.", 'Pizza hay sushi? Tùy bạn.', "It's up to you"],
      ["I don't mind where we go. It's up to you.", 'Đi đâu mình cũng được. Tùy bạn.', "It's up to you"],
    ]],
    ['get-along-with', 'get along with', '/ɡet əˈlɒŋ wɪð/', 'hòa hợp, hòa thuận với', 'Anh–Anh hay nói "get on with".', [['get on with', 'Anh–Anh'], ['be on good terms with', 'trang trọng hơn']], [
      ['Do you get along with your neighbours?', 'Bạn có hòa thuận với hàng xóm không?', 'get along with'],
      ['She gets along with everyone in the class.', 'Cô ấy hòa đồng với mọi người trong lớp.', 'gets along with'],
    ]],
    ['long-time-no-see', 'long time no see', '/lɒŋ taɪm nəʊ siː/', 'lâu rồi không gặp', 'Câu chào thân mật, không theo ngữ pháp chuẩn.', [["it's been ages", 'lâu lắm rồi'], ["it's been a while", 'nhẹ nhàng hơn']], [
      ['Hey Tom, long time no see! How have you been?', 'Chào Tom, lâu rồi không gặp! Dạo này thế nào?', 'long time no see'],
      ['Long time no see! You look great.', 'Lâu rồi không gặp! Trông bạn tuyệt lắm.', 'Long time no see'],
    ]],
    ['have-a-word', 'have a word with', '/hæv ə wɜːd wɪð/', 'nói chuyện riêng (ngắn) với ai', 'Thường vì có chuyện cần góp ý hoặc nhờ vả.', [['talk to', 'trung tính'], ['speak with', 'lịch sự hơn']], [
      ['Can I have a word with you after the meeting?', 'Sau buổi họp tôi nói chuyện riêng với anh một chút được không?', 'have a word with'],
      ['I had a word with the manager about the noise.', 'Tôi đã nói với quản lý về chuyện ồn ào.', 'had a word with'],
    ]],
    ['make-yourself-at-home', 'make yourself at home', '/meɪk jɔːˈself ət həʊm/', 'cứ tự nhiên như ở nhà', 'Câu chủ nhà nói với khách.', [['feel free', 'cứ tự nhiên'], ['help yourself', 'cứ tự lấy (đồ ăn, uống)']], [
      ['Come in and make yourself at home.', 'Vào đi, cứ tự nhiên như ở nhà nhé.', 'make yourself at home'],
      ['Please make yourselves at home while I make tea.', 'Mọi người cứ tự nhiên trong lúc tôi pha trà.', 'make yourselves at home'],
    ]],
    ['lend-a-hand', 'lend a hand', '/lend ə hænd/', 'giúp một tay', 'Thân thiện, thường khi việc cần thêm người.', [['help out', 'giúp đỡ'], ['give someone a hand', 'gần như đồng nghĩa']], [
      ['Could you lend a hand with these boxes?', 'Bạn giúp mình một tay mấy cái thùng này được không?', 'lend a hand'],
      ['Our neighbours lent a hand when we moved.', 'Hàng xóm đã giúp một tay khi chúng tôi chuyển nhà.', 'lent a hand'],
    ]],
    ['speak-your-mind', 'speak your mind', '/spiːk jɔː maɪnd/', 'nói thẳng suy nghĩ của mình', 'Mang nghĩa tích cực: thẳng thắn, không ngại.', [['be upfront', 'thẳng thắn'], ['say what you think', 'nghĩa đen']], [
      ["Don't be shy. Speak your mind.", 'Đừng ngại. Cứ nói thẳng suy nghĩ của bạn.', 'Speak your mind'],
      ['She always speaks her mind in meetings.', 'Cô ấy luôn nói thẳng ý kiến trong các buổi họp.', 'speaks her mind'],
    ]],
  ]),
  ...deck('deck-cong-so', [
    ['meet-deadline', 'meet a deadline', '/miːt ə ˈdedlaɪn/', 'kịp hạn chót', 'Trái nghĩa: "miss a deadline".', [['finish on time', 'hoàn thành đúng hạn'], ['deliver on schedule', 'trang trọng']], [
      ['We worked late to meet the deadline.', 'Chúng tôi làm muộn để kịp hạn chót.', 'meet the deadline'],
      ['She has never failed to meet a deadline.', 'Cô ấy chưa bao giờ trễ hạn.', 'meet a deadline'],
    ]],
    ['follow-up-on', 'follow up on', '/ˈfɒləʊ ʌp ɒn/', 'theo dõi tiếp, liên hệ lại về', 'Rất phổ biến trong email công việc.', [['get back to', 'phản hồi lại'], ['check on', 'kiểm tra tình hình']], [
      ["I'm writing to follow up on our call last week.", 'Tôi viết thư để trao đổi tiếp về cuộc gọi tuần trước.', 'follow up on'],
      ['He followed up on the customer complaint the same day.', 'Anh ấy xử lý tiếp khiếu nại của khách ngay trong ngày.', 'followed up on'],
    ]],
    ['take-the-lead', 'take the lead', '/teɪk ðə liːd/', 'đứng ra dẫn dắt, chủ động', 'Thể hiện tinh thần lãnh đạo.', [['step up', 'đứng ra nhận trách nhiệm'], ['spearhead', 'trang trọng, dẫn đầu dự án']], [
      ['Anna will take the lead on the new project.', 'Anna sẽ dẫn dắt dự án mới.', 'take the lead'],
      ['Nobody spoke, so I took the lead.', 'Không ai lên tiếng nên tôi chủ động.', 'took the lead'],
    ]],
    ['outside-the-box', 'think outside the box', '/θɪŋk ˌaʊtˈsaɪd ðə bɒks/', 'tư duy sáng tạo, khác lối mòn', 'Hay dùng trong brainstorm; hơi sáo rỗng nếu lạm dụng.', [['be creative', 'sáng tạo'], ['think differently', 'nghĩ khác']], [
      ['We need to think outside the box to win this client.', 'Ta cần nghĩ khác lối mòn để giành khách hàng này.', 'think outside the box'],
      ['Her idea shows she can think outside the box.', 'Ý tưởng của cô ấy cho thấy cô có tư duy sáng tạo.', 'think outside the box'],
    ]],
    ['keep-posted', 'keep someone posted', '/kiːp ˈsʌmwʌn ˈpəʊstɪd/', 'cập nhật tình hình cho ai', 'Hay gặp nhất: "Keep me posted."', [['keep someone updated', 'trung tính'], ['keep someone in the loop', 'cho ai biết thông tin']], [
      ['Please keep me posted on the delivery.', 'Nhớ cập nhật cho tôi về việc giao hàng nhé.', 'keep me posted'],
      ["I'll keep you posted if anything changes.", 'Có gì thay đổi tôi sẽ báo anh.', 'keep you posted'],
    ]],
    ['drawing-board', 'back to the drawing board', '/bæk tə ðə ˈdrɔːɪŋ bɔːd/', 'làm lại từ đầu (vì kế hoạch thất bại)', 'Thừa nhận thất bại một cách nhẹ nhàng.', [['start over', 'bắt đầu lại'], ['rethink', 'suy nghĩ lại']], [
      ['The client hated the design, so it is back to the drawing board.', 'Khách hàng không thích thiết kế, nên phải làm lại từ đầu.', 'back to the drawing board'],
      ['After the test failed, we went back to the drawing board.', 'Sau khi thử nghiệm thất bại, chúng tôi làm lại từ đầu.', 'back to the drawing board'],
    ]],
    ['work-from-home', 'work from home', '/wɜːk frəm həʊm/', 'làm việc tại nhà', 'Viết tắt: WFH.', [['work remotely', 'làm từ xa'], ['telecommute', 'trang trọng, ít dùng hơn']], [
      ['I work from home on Mondays and Fridays.', 'Tôi làm việc tại nhà vào thứ Hai và thứ Sáu.', 'work from home'],
      ['Many companies let staff work from home.', 'Nhiều công ty cho nhân viên làm việc tại nhà.', 'work from home'],
    ]],
    ['extra-mile', 'go the extra mile', '/ɡəʊ ði ˈekstrə maɪl/', 'nỗ lực hơn mức yêu cầu', 'Lời khen cho thái độ làm việc.', [['go above and beyond', 'gần như đồng nghĩa'], ['make an extra effort', 'nghĩa đen']], [
      ['Our support team always goes the extra mile.', 'Đội hỗ trợ của chúng tôi luôn nỗ lực hơn cả mong đợi.', 'goes the extra mile'],
      ['She went the extra mile to finish the report early.', 'Cô ấy đã cố gắng hết sức để nộp báo cáo sớm.', 'went the extra mile'],
    ]],
    ['cut-corners', 'cut corners', '/kʌt ˈkɔːnəz/', 'làm ẩu, đi tắt để tiết kiệm', 'Tiêu cực; ngụ ý giảm chất lượng.', [['skimp', 'bớt xén'], ['take shortcuts', 'đi đường tắt']], [
      ["Don't cut corners on safety.", 'Đừng làm ẩu trong vấn đề an toàn.', 'cut corners'],
      ['The builders cut corners, and the roof leaked.', 'Thợ xây làm ẩu nên mái bị dột.', 'cut corners'],
    ]],
    ['up-to-speed', 'bring someone up to speed', '/brɪŋ ˈsʌmwʌn ʌp tə spiːd/', 'cập nhật cho ai nắm kịp tình hình', 'Dùng khi có người mới vào dự án.', [['brief', 'tóm tắt cho ai'], ['fill someone in', 'kể cho ai biết']], [
      ['Can you bring the new intern up to speed?', 'Bạn hướng dẫn cho bạn thực tập mới nắm tình hình nhé?', 'up to speed'],
      ['I spent the morning getting up to speed on the project.', 'Tôi mất cả buổi sáng để nắm bắt dự án.', 'up to speed'],
    ]],
    ['wrap-up', 'wrap up', '/ræp ʌp/', 'kết thúc, tổng kết', 'Hay dùng khi kết thúc cuộc họp.', [['conclude', 'trang trọng'], ['finish', 'trung tính']], [
      ["Let's wrap up the meeting here.", 'Mình kết thúc buổi họp tại đây nhé.', 'wrap up'],
      ['We wrapped up the project ahead of time.', 'Chúng tôi hoàn tất dự án trước thời hạn.', 'wrapped up'],
    ]],
  ]),
  ...deck('deck-du-lich', [
    ['check-in', 'check in', '/tʃek ɪn/', 'làm thủ tục nhận phòng / lên máy bay', 'Danh từ: "check-in".', [['register', 'đăng ký (khách sạn)'], ['arrive', 'nghĩa chung']], [
      ['You can check in at the hotel after 2 p.m.', 'Bạn có thể nhận phòng khách sạn sau 2 giờ chiều.', 'check in'],
      ['We checked in online the night before the flight.', 'Chúng tôi làm thủ tục trực tuyến tối hôm trước chuyến bay.', 'checked in'],
    ]],
    ['check-out', 'check out', '/tʃek aʊt/', 'trả phòng', 'Cũng có nghĩa "xem thử" trong khẩu ngữ.', [['leave', 'rời đi'], ['settle the bill', 'thanh toán']], [
      ['What time do we have to check out?', 'Mấy giờ chúng ta phải trả phòng?', 'check out'],
      ['They checked out early to catch the train.', 'Họ trả phòng sớm để kịp tàu.', 'checked out'],
    ]],
    ['jet-lag', 'get over jet lag', '/ɡet ˈəʊvə ˈdʒet læɡ/', 'hết mệt do lệch múi giờ', 'Jet lag: mệt mỏi sau chuyến bay dài qua nhiều múi giờ.', [['recover from jet lag', 'trang trọng hơn'], ['adjust to the time zone', 'thích nghi múi giờ']], [
      ['It took me three days to get over jet lag.', 'Tôi mất ba ngày mới hết lệch múi giờ.', 'get over jet lag'],
      ['Drinking water helps you get over jet lag.', 'Uống nước giúp bạn mau hết mệt do lệch múi giờ.', 'get over jet lag'],
    ]],
    ['book-in-advance', 'book in advance', '/bʊk ɪn ədˈvɑːns/', 'đặt trước', 'Có thể chèn tân ngữ: "book tickets in advance".', [['reserve ahead', 'đặt chỗ trước'], ['pre-book', 'đặt trước']], [
      ['It is cheaper to book in advance.', 'Đặt trước sẽ rẻ hơn.', 'book in advance'],
      ['We booked the tour in advance.', 'Chúng tôi đã đặt tour trước.', 'in advance'],
    ]],
    ['see-the-sights', 'see the sights', '/siː ðə saɪts/', 'đi tham quan danh lam thắng cảnh', 'Gần nghĩa "go sightseeing".', [['go sightseeing', 'đi ngắm cảnh'], ['explore', 'khám phá']], [
      ['We spent the day seeing the sights of Rome.', 'Chúng tôi dành cả ngày tham quan các thắng cảnh ở Rome.', 'seeing the sights'],
      ['If you have time, see the sights in the old town.', 'Nếu có thời gian, hãy đi thăm khu phố cổ.', 'see the sights'],
    ]],
    ['get-lost', 'get lost', '/ɡet lɒst/', 'bị lạc đường', 'Lưu ý: "Get lost!" là câu đuổi khéo, bất lịch sự.', [['lose your way', 'trang trọng hơn'], ['be lost', 'đang bị lạc']], [
      ['We got lost in the narrow streets of Hoi An.', 'Chúng tôi bị lạc trong những con phố hẹp ở Hội An.', 'got lost'],
      ["Take a map so you don't get lost.", 'Mang theo bản đồ để khỏi bị lạc.', 'get lost'],
    ]],
    ['round-trip', 'round-trip ticket', '/ˌraʊnd trɪp ˈtɪkɪt/', 'vé khứ hồi', 'Anh–Anh: "return ticket".', [['return ticket', 'Anh–Anh'], ['one-way ticket', 'trái nghĩa: vé một chiều']], [
      ['A round-trip ticket to Da Nang costs about two million dong.', 'Vé khứ hồi đi Đà Nẵng khoảng hai triệu đồng.', 'round-trip ticket'],
      ['Is it cheaper to buy a round-trip ticket?', 'Mua vé khứ hồi có rẻ hơn không?', 'round-trip ticket'],
    ]],
    ['take-off', 'take off', '/teɪk ɒf/', '(máy bay) cất cánh', 'Cũng có nghĩa "cởi (đồ)".', [['depart', 'khởi hành, trang trọng'], ['lift off', 'tên lửa, máy bay']], [
      ['The plane will take off in ten minutes.', 'Máy bay sẽ cất cánh sau mười phút.', 'take off'],
      ['Our flight took off two hours late.', 'Chuyến bay của chúng tôi cất cánh trễ hai tiếng.', 'took off'],
    ]],
    ['set-off', 'set off', '/set ɒf/', 'lên đường, khởi hành', 'Hay dùng cho chuyến đi bằng đường bộ.', [['head off', 'khẩu ngữ'], ['set out', 'gần như đồng nghĩa']], [
      ['We set off at dawn to avoid the traffic.', 'Chúng tôi lên đường lúc bình minh để tránh tắc đường.', 'set off'],
      ['What time should we set off tomorrow?', 'Mai mấy giờ mình xuất phát?', 'set off'],
    ]],
    ['backpacking', 'go backpacking', '/ɡəʊ ˈbækpækɪŋ/', 'đi du lịch bụi', 'Đi tiết kiệm, mang ba lô, tự túc.', [['travel on a shoestring', 'du lịch tiết kiệm'], ['go trekking', 'đi bộ đường dài']], [
      ['He went backpacking around Southeast Asia.', 'Anh ấy đi du lịch bụi khắp Đông Nam Á.', 'went backpacking'],
      ['I want to go backpacking after graduation.', 'Tôi muốn đi phượt sau khi tốt nghiệp.', 'go backpacking'],
    ]],
    ['tourist-trap', 'a tourist trap', '/ə ˈtʊərɪst træp/', 'nơi chặt chém khách du lịch', 'Đông khách, đắt đỏ, kém chất lượng.', [['overpriced spot', 'chỗ đắt đỏ'], ['rip-off', 'sự chặt chém']], [
      ['That restaurant is a tourist trap. Eat where the locals eat.', 'Nhà hàng đó chặt chém khách du lịch. Hãy ăn chỗ dân địa phương ăn.', 'a tourist trap'],
      ['The market has become a tourist trap.', 'Khu chợ đã trở thành nơi chặt chém du khách.', 'a tourist trap'],
    ]],
  ]),
  ...deck('deck-ielts', [
    ['have-access-to', 'have access to', '/hæv ˈækses tuː/', 'được tiếp cận, có quyền sử dụng', 'Học thuật; "access" là danh từ không đếm được.', [['be able to use', 'nghĩa đen'], ['gain access to', 'nhấn mạnh quá trình đạt được']], [
      ['Many rural children do not have access to the internet.', 'Nhiều trẻ em nông thôn không được tiếp cận internet.', 'have access to'],
      ['Everyone should have access to clean water.', 'Mọi người đều nên được tiếp cận nước sạch.', 'have access to'],
    ]],
    ['pose-a-threat', 'pose a threat to', '/pəʊz ə θret tuː/', 'gây ra mối đe dọa cho', 'Collocation học thuật, thay cho "be dangerous to".', [['endanger', 'gây nguy hiểm'], ['threaten', 'đe dọa']], [
      ['Rising sea levels pose a threat to coastal cities.', 'Mực nước biển dâng gây đe dọa cho các thành phố ven biển.', 'pose a threat to'],
      ['Fake news poses a threat to democracy.', 'Tin giả là mối đe dọa đối với nền dân chủ.', 'poses a threat to'],
    ]],
    ['bridge-the-gap', 'bridge the gap', '/brɪdʒ ðə ɡæp/', 'thu hẹp khoảng cách', 'Thường: "bridge the gap between A and B".', [['narrow the gap', 'gần như đồng nghĩa'], ['close the gap', 'xóa bỏ khoảng cách']], [
      ['Education can bridge the gap between rich and poor.', 'Giáo dục có thể thu hẹp khoảng cách giàu nghèo.', 'bridge the gap'],
      ['The programme helps bridge the gap between school and work.', 'Chương trình giúp thu hẹp khoảng cách giữa trường học và công việc.', 'bridge the gap'],
    ]],
    ['tackle-problem', 'tackle the problem', '/ˈtækl ðə ˈprɒbləm/', 'giải quyết vấn đề', 'Mạnh và chủ động hơn "solve".', [['address the issue', 'trang trọng'], ['deal with', 'trung tính']], [
      ['Governments must act now to tackle the problem of air pollution.', 'Chính phủ phải hành động ngay để giải quyết ô nhiễm không khí.', 'tackle the problem'],
      ['There are several ways to tackle the problem.', 'Có nhiều cách để giải quyết vấn đề này.', 'tackle the problem'],
    ]],
    ['growing-concern', 'a growing concern', '/ə ˈɡrəʊɪŋ kənˈsɜːn/', 'mối lo ngại ngày càng tăng', 'Dùng mở bài Writing Task 2 rất hiệu quả.', [['an increasing worry', 'gần nghĩa'], ['a pressing issue', 'vấn đề cấp bách']], [
      ['Obesity among children is a growing concern.', 'Béo phì ở trẻ em là mối lo ngại ngày càng tăng.', 'a growing concern'],
      ['Cybercrime has become a growing concern for banks.', 'Tội phạm mạng đang là mối lo ngày càng lớn của ngân hàng.', 'a growing concern'],
    ]],
    ['other-hand', 'on the other hand', '/ɒn ði ˈʌðə hænd/', 'mặt khác', 'Từ nối so sánh hai mặt đối lập.', [['however', 'tuy nhiên'], ['conversely', 'ngược lại, trang trọng']], [
      ['Cities offer jobs. On the other hand, they are expensive.', 'Thành phố có nhiều việc làm. Mặt khác, chi phí lại đắt đỏ.', 'On the other hand'],
      ['Online learning is flexible; on the other hand, it can feel isolating.', 'Học trực tuyến linh hoạt; mặt khác, nó có thể khiến người học cô đơn.', 'on the other hand'],
    ]],
    ['meet-demand', 'meet the demand for', '/miːt ðə dɪˈmɑːnd fɔː/', 'đáp ứng nhu cầu về', 'Hay dùng khi bàn về kinh tế, dân số.', [['satisfy the need for', 'trang trọng'], ['keep up with demand', 'theo kịp nhu cầu']], [
      ['Farmers struggle to meet the demand for organic food.', 'Nông dân chật vật đáp ứng nhu cầu thực phẩm hữu cơ.', 'meet the demand for'],
      ['More schools are needed to meet the demand for education.', 'Cần thêm trường học để đáp ứng nhu cầu giáo dục.', 'meet the demand for'],
    ]],
    ['strike-balance', 'strike a balance between', '/straɪk ə ˈbæləns bɪˈtwiːn/', 'cân bằng giữa', 'Thường đi với "work and life", "growth and environment".', [['balance', 'động từ, ngắn gọn'], ['find a middle ground', 'tìm điểm dung hòa']], [
      ['It is hard to strike a balance between work and family.', 'Thật khó cân bằng giữa công việc và gia đình.', 'strike a balance between'],
      ['Policies should strike a balance between growth and conservation.', 'Chính sách nên cân bằng giữa tăng trưởng và bảo tồn.', 'strike a balance between'],
    ]],
    ['contribute-to', 'contribute to', '/kənˈtrɪbjuːt tuː/', 'góp phần vào, là một nguyên nhân của', 'Dùng cho cả kết quả tốt lẫn xấu.', [['lead to', 'dẫn đến'], ['play a part in', 'đóng một vai trò']], [
      ['Cars contribute to air pollution.', 'Xe hơi góp phần gây ô nhiễm không khí.', 'contribute to'],
      ['Volunteers contributed to the success of the event.', 'Tình nguyện viên đã góp phần vào thành công của sự kiện.', 'contributed to'],
    ]],
    ['long-run', 'in the long run', '/ɪn ðə lɒŋ rʌn/', 'về lâu dài', 'Trái nghĩa: "in the short term".', [['in the long term', 'trang trọng hơn'], ['eventually', 'cuối cùng']], [
      ['Investing in education pays off in the long run.', 'Đầu tư cho giáo dục sẽ mang lại lợi ích về lâu dài.', 'in the long run'],
      ['In the long run, renewable energy is cheaper.', 'Về lâu dài, năng lượng tái tạo rẻ hơn.', 'In the long run'],
    ]],
    ['make-progress', 'make progress', '/meɪk ˈprəʊɡres/', 'tiến bộ, đạt tiến triển', 'Không nói "do progress".', [['improve', 'cải thiện'], ['advance', 'tiến lên']], [
      ['Scientists have made progress in cancer research.', 'Các nhà khoa học đã có tiến triển trong nghiên cứu ung thư.', 'made progress'],
      ['You will make progress if you practise every day.', 'Bạn sẽ tiến bộ nếu luyện tập mỗi ngày.', 'make progress'],
    ]],
  ]),
  ...deck('deck-phrasal', [
    ['give-up', 'give up', '/ɡɪv ʌp/', 'từ bỏ', 'Theo sau là V-ing: "give up smoking".', [['quit', 'bỏ (thói quen)'], ['abandon', 'trang trọng']], [
      ["Don't give up. You're almost there!", 'Đừng bỏ cuộc. Sắp tới đích rồi!', 'give up'],
      ['My dad gave up smoking last year.', 'Bố tôi đã bỏ thuốc lá năm ngoái.', 'gave up'],
    ]],
    ['look-forward-to', 'look forward to', '/lʊk ˈfɔːwəd tuː/', 'mong chờ', '"to" là giới từ, nên theo sau là V-ing.', [['can\'t wait for', 'thân mật'], ['anticipate', 'trang trọng']], [
      ['I look forward to hearing from you.', 'Tôi mong sớm nhận được hồi âm của anh.', 'look forward to'],
      ['The kids are looking forward to the holidays.', 'Bọn trẻ đang háo hức chờ kỳ nghỉ.', 'looking forward to'],
    ]],
    ['figure-out', 'figure out', '/ˈfɪɡə aʊt/', 'tìm ra, hiểu ra', 'Khẩu ngữ phổ biến.', [['work out', 'Anh–Anh'], ['solve', 'giải quyết']], [
      ["I can't figure out how this machine works.", 'Tôi không hiểu cái máy này hoạt động thế nào.', 'figure out'],
      ['She finally figured out the answer.', 'Cuối cùng cô ấy cũng tìm ra đáp án.', 'figured out'],
    ]],
    ['put-off', 'put off', '/pʊt ɒf/', 'hoãn lại, trì hoãn', 'Thường mang nghĩa trì hoãn việc không muốn làm.', [['postpone', 'trang trọng'], ['delay', 'trung tính']], [
      ['Stop putting off your homework.', 'Đừng trì hoãn bài tập nữa.', 'putting off'],
      ['The match was put off because of the rain.', 'Trận đấu bị hoãn vì mưa.', 'put off'],
    ]],
    ['come-up-with', 'come up with', '/kʌm ʌp wɪð/', 'nghĩ ra (ý tưởng, giải pháp)', 'Rất hay dùng cả khi nói lẫn viết.', [['think of', 'nghĩ đến'], ['devise', 'trang trọng']], [
      ['We need to come up with a better plan.', 'Chúng ta cần nghĩ ra kế hoạch tốt hơn.', 'come up with'],
      ['Who came up with this name?', 'Ai nghĩ ra cái tên này vậy?', 'came up with'],
    ]],
    ['run-into', 'run into', '/rʌn ˈɪntuː/', 'tình cờ gặp', 'Cũng có nghĩa "gặp phải (khó khăn)".', [['bump into', 'gần như đồng nghĩa'], ['come across', 'tình cờ thấy']], [
      ['I ran into my old teacher at the supermarket.', 'Tôi tình cờ gặp thầy giáo cũ ở siêu thị.', 'ran into'],
      ['You never know who you might run into here.', 'Ở đây chẳng biết sẽ gặp ai đâu.', 'run into'],
    ]],
    ['turn-down', 'turn down', '/tɜːn daʊn/', 'từ chối; vặn nhỏ', 'Từ chối lời mời, đề nghị.', [['reject', 'trang trọng, mạnh hơn'], ['decline', 'lịch sự']], [
      ['She turned down the job offer.', 'Cô ấy từ chối lời mời làm việc.', 'turned down'],
      ['Could you turn down the music, please?', 'Bạn vặn nhỏ nhạc được không?', 'turn down'],
    ]],
    ['carry-on', 'carry on', '/ˈkæri ɒn/', 'tiếp tục', 'Theo sau là V-ing hoặc "with".', [['continue', 'trang trọng'], ['keep going', 'khẩu ngữ']], [
      ['Sorry to interrupt. Please carry on.', 'Xin lỗi đã cắt ngang. Mời anh tiếp tục.', 'carry on'],
      ['They carried on working despite the noise.', 'Họ vẫn tiếp tục làm việc dù ồn ào.', 'carried on'],
    ]],
    ['look-up', 'look up', '/lʊk ʌp/', 'tra cứu', 'Tra từ điển, tìm thông tin.', [['search for', 'tìm kiếm'], ['check', 'kiểm tra']], [
      ['Look up any new words in the dictionary.', 'Hãy tra từ điển các từ mới.', 'Look up'],
      ['I looked up the opening hours online.', 'Tôi tra giờ mở cửa trên mạng.', 'looked up'],
    ]],
    ['set-up', 'set up', '/set ʌp/', 'thành lập; lắp đặt', 'Danh từ: "setup".', [['establish', 'thành lập, trang trọng'], ['install', 'lắp đặt']], [
      ['She set up her own company at 25.', 'Cô ấy lập công ty riêng năm 25 tuổi.', 'set up'],
      ['Can you help me set up the projector?', 'Bạn giúp mình lắp máy chiếu được không?', 'set up'],
    ]],
    ['bring-up', 'bring up', '/brɪŋ ʌp/', 'nuôi nấng; nêu ra (chủ đề)', 'Hai nghĩa đều rất phổ biến.', [['raise', 'nuôi dạy'], ['mention', 'đề cập']], [
      ['She was brought up by her grandparents.', 'Cô ấy được ông bà nuôi lớn.', 'brought up'],
      ["Don't bring up politics at dinner.", 'Đừng nhắc đến chính trị trong bữa tối.', 'bring up'],
    ]],
    ['run-out-of', 'run out of', '/rʌn aʊt əv/', 'hết, cạn', 'Dùng cho thời gian, tiền, đồ dùng.', [['use up', 'dùng hết'], ['be short of', 'thiếu']], [
      ["We've run out of milk.", 'Nhà mình hết sữa rồi.', 'run out of'],
      ['I ran out of time before the last question.', 'Tôi hết giờ trước khi làm câu cuối.', 'ran out of'],
    ]],
  ]),
  ...deck('deck-idioms', [
    ['piece-of-cake', 'a piece of cake', '/ə piːs əv keɪk/', 'dễ như ăn kẹo', 'Thân mật.', [['a breeze', 'rất dễ'], ['easy as pie', 'dễ ợt']], [
      ['The test was a piece of cake.', 'Bài kiểm tra dễ như ăn kẹo.', 'a piece of cake'],
      ['For her, fixing computers is a piece of cake.', 'Với cô ấy, sửa máy tính là chuyện nhỏ.', 'a piece of cake'],
    ]],
    ['under-weather', 'under the weather', '/ˈʌndə ðə ˈweðə/', 'thấy hơi mệt, không khỏe', 'Nhẹ nhàng hơn "sick".', [['unwell', 'trang trọng'], ['off colour', 'Anh–Anh']], [
      ["I'm feeling a bit under the weather today.", 'Hôm nay tôi thấy hơi mệt trong người.', 'under the weather'],
      ['He stayed home because he was under the weather.', 'Anh ấy ở nhà vì không được khỏe.', 'under the weather'],
    ]],
    ['arm-and-leg', 'cost an arm and a leg', '/kɒst ən ɑːm ənd ə leɡ/', 'đắt cắt cổ', 'Phóng đại, thân mật.', [['cost a fortune', 'tốn cả gia tài'], ['be pricey', 'đắt']], [
      ['That new phone costs an arm and a leg.', 'Chiếc điện thoại mới đó đắt cắt cổ.', 'costs an arm and a leg'],
      ['Fixing the car cost an arm and a leg.', 'Sửa xe tốn cả đống tiền.', 'cost an arm and a leg'],
    ]],
    ['blue-moon', 'once in a blue moon', '/wʌns ɪn ə bluː muːn/', 'hiếm khi, năm thì mười họa', 'Thân mật.', [['rarely', 'hiếm khi'], ['hardly ever', 'hầu như không bao giờ']], [
      ['I only eat fast food once in a blue moon.', 'Năm thì mười họa tôi mới ăn đồ ăn nhanh.', 'once in a blue moon'],
      ['My brother calls once in a blue moon.', 'Anh tôi hiếm khi gọi điện.', 'once in a blue moon'],
    ]],
    ['nail-on-head', 'hit the nail on the head', '/hɪt ðə neɪl ɒn ðə hed/', 'nói trúng phóc', 'Khen ai nhận xét chính xác.', [['be spot on', 'chính xác'], ['get it exactly right', 'nghĩa đen']], [
      ['You hit the nail on the head with that comment.', 'Bạn nói trúng phóc vấn đề rồi.', 'hit the nail on the head'],
      ['I think Mai hit the nail on the head.', 'Tôi nghĩ Mai nói rất đúng.', 'hit the nail on the head'],
    ]],
    ['cat-out-of-bag', 'let the cat out of the bag', '/let ðə kæt aʊt əv ðə bæɡ/', 'lỡ lộ bí mật', 'Thường là vô tình.', [['spill the beans', 'tiết lộ bí mật'], ['give the game away', 'làm lộ chuyện']], [
      ['Who let the cat out of the bag about the party?', 'Ai làm lộ chuyện bữa tiệc vậy?', 'let the cat out of the bag'],
      ['I almost let the cat out of the bag.', 'Tôi suýt nữa thì lỡ miệng.', 'let the cat out of the bag'],
    ]],
    ['ball-in-court', 'the ball is in your court', '/ðə bɔːl ɪz ɪn jɔː kɔːt/', 'đến lượt bạn quyết định', 'Ám chỉ người kia phải hành động tiếp.', [["it's your move", 'đến lượt bạn'], ["it's up to you", 'tùy bạn']], [
      ["I've made my offer. The ball is in your court.", 'Tôi đã đưa ra đề nghị. Giờ đến lượt anh quyết.', 'The ball is in your court'],
      ['Now the ball is in their court.', 'Giờ thì quyền quyết định thuộc về họ.', 'the ball is in their court'],
    ]],
    ['bite-off', 'bite off more than you can chew', '/baɪt ɒf mɔː ðən juː kən tʃuː/', 'ôm đồm quá sức', 'Nhận làm nhiều hơn khả năng.', [['take on too much', 'nhận quá nhiều việc'], ['overcommit', 'cam kết quá mức']], [
      ["Don't bite off more than you can chew.", 'Đừng ôm đồm quá sức mình.', 'bite off more than you can chew'],
      ['I bit off more than I could chew with three jobs.', 'Tôi ôm ba việc một lúc, quá sức mình.', 'bit off more than I could chew'],
    ]],
    ['spill-beans', 'spill the beans', '/spɪl ðə biːnz/', 'khai ra, tiết lộ bí mật', 'Thân mật.', [['reveal', 'tiết lộ'], ['blab', 'buột miệng']], [
      ['Come on, spill the beans! Who is he?', 'Thôi nào, khai ra đi! Anh ta là ai?', 'spill the beans'],
      ['She spilled the beans about the surprise.', 'Cô ấy đã tiết lộ bất ngờ.', 'spilled the beans'],
    ]],
    ['pigs-fly', 'when pigs fly', '/wen pɪɡz flaɪ/', 'còn lâu mới có chuyện đó', 'Mỉa mai điều không thể xảy ra.', [['never', 'không bao giờ'], ['not in a million years', 'còn lâu']], [
      ["He'll clean his room when pigs fly.", 'Còn lâu nó mới dọn phòng.', 'when pigs fly'],
      ['"Will the bus be on time?" "When pigs fly."', '"Xe buýt sẽ đến đúng giờ chứ?" "Còn lâu."', 'When pigs fly'],
    ]],
    ['midnight-oil', 'burn the midnight oil', '/bɜːn ðə ˈmɪdnaɪt ɔɪl/', 'thức khuya làm việc / học bài', 'Hay dùng trước kỳ thi, hạn chót.', [['stay up late', 'thức khuya'], ['pull an all-nighter', 'thức trắng đêm']], [
      ['I burned the midnight oil before the exam.', 'Tôi thức khuya học bài trước kỳ thi.', 'burned the midnight oil'],
      ['The team is burning the midnight oil to launch on time.', 'Cả đội đang thức khuya để ra mắt đúng hạn.', 'burning the midnight oil'],
    ]],
    ['two-birds', 'kill two birds with one stone', '/kɪl tuː bɜːdz wɪð wʌn stəʊn/', 'một công đôi việc', 'Tương đương "nhất cử lưỡng tiện".', [['multitask', 'làm nhiều việc cùng lúc'], ['two for one', 'được cả hai']], [
      ['Cycling to work kills two birds with one stone: exercise and saving money.', 'Đạp xe đi làm là một công đôi việc: vừa tập thể dục vừa tiết kiệm tiền.', 'kills two birds with one stone'],
      ['I killed two birds with one stone and visited my aunt on the way.', 'Tôi tiện đường ghé thăm dì, một công đôi việc.', 'killed two birds with one stone'],
    ]],
  ]),
  ...deck('deck-cam-xuc', [
    ['over-the-moon', 'over the moon', '/ˈəʊvə ðə muːn/', 'vui sướng tột độ', 'Thân mật, Anh–Anh rất hay dùng.', [['thrilled', 'rất vui'], ['delighted', 'trang trọng hơn']], [
      ['She was over the moon about the new job.', 'Cô ấy vui như mở cờ vì công việc mới.', 'over the moon'],
      ["We're over the moon with the results.", 'Chúng tôi cực kỳ vui với kết quả.', 'over the moon'],
    ]],
    ['cloud-nine', 'on cloud nine', '/ɒn klaʊd naɪn/', 'lâng lâng hạnh phúc', 'Thường sau tin vui lớn.', [['walking on air', 'vui sướng lâng lâng'], ['ecstatic', 'ngây ngất']], [
      ['He has been on cloud nine since the wedding.', 'Anh ấy lâng lâng hạnh phúc từ sau đám cưới.', 'on cloud nine'],
      ['Passing the exam put me on cloud nine.', 'Thi đỗ khiến tôi sướng rơn.', 'on cloud nine'],
    ]],
    ['fed-up', 'fed up with', '/fed ʌp wɪð/', 'chán ngấy, phát ngán', 'Thể hiện bực bội kéo dài.', [['sick of', 'phát ốm vì'], ['tired of', 'mệt mỏi vì']], [
      ["I'm fed up with this traffic.", 'Tôi phát ngán với cảnh tắc đường này.', 'fed up with'],
      ['She got fed up with waiting and left.', 'Cô ấy chán chờ nên bỏ về.', 'fed up with'],
    ]],
    ['feel-at-ease', 'feel at ease', '/fiːl ət iːz/', 'cảm thấy thoải mái, yên tâm', 'Trái nghĩa: "ill at ease".', [['feel comfortable', 'trung tính'], ['feel relaxed', 'thư giãn']], [
      ['The friendly staff made us feel at ease.', 'Nhân viên thân thiện khiến chúng tôi thấy thoải mái.', 'feel at ease'],
      ["I don't feel at ease speaking in public.", 'Tôi không thấy thoải mái khi nói trước đám đông.', 'feel at ease'],
    ]],
    ['on-nerves', "get on someone's nerves", '/ɡet ɒn ˈsʌmwʌnz nɜːvz/', 'làm ai bực mình', 'Dùng cho thói quen, âm thanh gây khó chịu.', [['annoy', 'làm phiền'], ['drive someone crazy', 'làm ai phát điên']], [
      ['His constant humming gets on my nerves.', 'Cái kiểu ngân nga suốt của anh ta làm tôi phát bực.', 'gets on my nerves'],
      ['Stop it! You are getting on my nerves.', 'Thôi đi! Bạn làm mình bực rồi đấy.', 'getting on my nerves'],
    ]],
    ['down-in-dumps', 'down in the dumps', '/daʊn ɪn ðə dʌmps/', 'buồn chán, ủ rũ', 'Thân mật.', [['feeling low', 'tâm trạng đi xuống'], ['blue', 'buồn']], [
      ["He's been down in the dumps since his team lost.", 'Anh ấy ủ rũ từ khi đội nhà thua.', 'down in the dumps'],
      ['Rainy days make me feel down in the dumps.', 'Những ngày mưa khiến tôi thấy buồn chán.', 'down in the dumps'],
    ]],
    ['butterflies', 'have butterflies in your stomach', '/hæv ˈbʌtəflaɪz ɪn jɔː ˈstʌmək/', 'hồi hộp, bồn chồn', 'Trước buổi phỏng vấn, biểu diễn, hẹn hò.', [['feel nervous', 'lo lắng'], ['be jittery', 'bồn chồn']], [
      ['I always have butterflies in my stomach before a speech.', 'Tôi luôn hồi hộp trước khi phát biểu.', 'butterflies in my stomach'],
      ['She had butterflies in her stomach on her first day.', 'Cô ấy bồn chồn trong ngày đầu tiên.', 'butterflies in her stomach'],
    ]],
    ['lose-temper', 'lose your temper', '/luːz jɔː ˈtempə/', 'nổi nóng, mất bình tĩnh', 'Trái nghĩa: "keep your temper".', [['fly off the handle', 'nổi khùng, khẩu ngữ'], ['get angry', 'nghĩa đen']], [
      ['Try not to lose your temper with the kids.', 'Cố đừng nổi nóng với bọn trẻ.', 'lose your temper'],
      ['He lost his temper and shouted at everyone.', 'Anh ta mất bình tĩnh và quát mọi người.', 'lost his temper'],
    ]],
    ['calm-down', 'calm down', '/kɑːm daʊn/', 'bình tĩnh lại', 'Nói với người đang kích động; dễ bị coi là trịch thượng.', [['relax', 'thư giãn'], ['take it easy', 'từ từ thôi']], [
      ['Calm down and tell me what happened.', 'Bình tĩnh và kể cho tôi chuyện gì đã xảy ra.', 'Calm down'],
      ['It took her a while to calm down.', 'Cô ấy mất một lúc mới bình tĩnh lại.', 'calm down'],
    ]],
    ['scared-to-death', 'scared to death', '/skeəd tə deθ/', 'sợ chết khiếp', 'Phóng đại.', [['terrified', 'kinh hãi'], ['petrified', 'sợ cứng người']], [
      ["I'm scared to death of snakes.", 'Tôi sợ rắn chết khiếp.', 'scared to death'],
      ['The thunder scared the kids to death.', 'Tiếng sấm làm bọn trẻ sợ chết khiếp.', 'to death'],
    ]],
    ['burst-into-tears', 'burst into tears', '/bɜːst ˈɪntə tɪəz/', 'òa khóc', 'Khóc đột ngột.', [['break down', 'suy sụp, bật khóc'], ['start crying', 'nghĩa đen']], [
      ['She burst into tears when she heard the news.', 'Cô ấy òa khóc khi nghe tin.', 'burst into tears'],
      ['The little boy burst into tears after falling.', 'Cậu bé òa khóc sau khi ngã.', 'burst into tears'],
    ]],
  ]),
  ...deck('deck-tien-bac', [
    ['ends-meet', 'make ends meet', '/meɪk endz miːt/', 'xoay xở đủ sống', 'Ngụ ý thu nhập eo hẹp.', [['get by', 'sống tạm được'], ['scrape by', 'chật vật sống qua ngày']], [
      ['Many families struggle to make ends meet.', 'Nhiều gia đình chật vật để đủ sống.', 'make ends meet'],
      ['He works two jobs to make ends meet.', 'Anh ấy làm hai việc để trang trải cuộc sống.', 'make ends meet'],
    ]],
    ['save-up', 'save up for', '/seɪv ʌp fɔː/', 'dành dụm để mua', 'Tiết kiệm cho mục tiêu cụ thể.', [['put money aside', 'để dành tiền'], ['set aside', 'dành riêng']], [
      ["I'm saving up for a new laptop.", 'Tôi đang dành dụm để mua laptop mới.', 'saving up for'],
      ['They saved up for years to buy a house.', 'Họ dành dụm nhiều năm để mua nhà.', 'saved up for'],
    ]],
    ['rip-off', 'a rip-off', '/ə ˈrɪp ɒf/', 'sự chặt chém, giá cắt cổ', 'Khẩu ngữ.', [['overpriced', 'đắt quá mức'], ['daylight robbery', 'Anh–Anh, cướp giữa ban ngày']], [
      ['Ten dollars for a coffee? That is a rip-off!', 'Mười đô một ly cà phê? Chặt chém quá!', 'a rip-off'],
      ['The souvenir shop near the beach is a rip-off.', 'Cửa hàng lưu niệm gần biển bán giá cắt cổ.', 'a rip-off'],
    ]],
    ['tight-budget', 'on a tight budget', '/ɒn ə taɪt ˈbʌdʒɪt/', 'ngân sách eo hẹp', 'Phải chi tiêu dè sẻn.', [['strapped for cash', 'kẹt tiền'], ['on a shoestring', 'với rất ít tiền']], [
      ["We're travelling on a tight budget.", 'Chúng tôi đi du lịch với ngân sách eo hẹp.', 'on a tight budget'],
      ['Students often live on a tight budget.', 'Sinh viên thường sống tằn tiện.', 'on a tight budget'],
    ]],
    ['shop-around', 'shop around', '/ʃɒp əˈraʊnd/', 'tham khảo giá nhiều nơi', 'Trước khi mua để tìm giá tốt.', [['compare prices', 'so sánh giá'], ['look around', 'xem xung quanh']], [
      ['It pays to shop around before buying a car.', 'Nên tham khảo nhiều nơi trước khi mua xe.', 'shop around'],
      ['I shopped around and found a cheaper flight.', 'Tôi so giá nhiều nơi và tìm được vé rẻ hơn.', 'shopped around'],
    ]],
    ['pay-in-cash', 'pay in cash', '/peɪ ɪn kæʃ/', 'trả bằng tiền mặt', 'Đối lập: "pay by card".', [['pay cash', 'khẩu ngữ'], ['pay by card', 'trả bằng thẻ']], [
      ['Can I pay in cash?', 'Tôi trả tiền mặt được không?', 'pay in cash'],
      ['Street vendors prefer you to pay in cash.', 'Người bán hàng rong thích bạn trả tiền mặt.', 'pay in cash'],
    ]],
    ['go-dutch', 'go Dutch', '/ɡəʊ dʌtʃ/', 'chia tiền, ai trả phần nấy', 'Hay dùng khi đi ăn, hẹn hò.', [['split the bill', 'chia hóa đơn'], ['pay separately', 'trả riêng']], [
      ["Let's go Dutch tonight.", 'Tối nay mình chia tiền nhé.', 'go Dutch'],
      ['On our first date we went Dutch.', 'Buổi hẹn đầu chúng tôi chia đôi tiền.', 'went Dutch'],
    ]],
    ['break-bank', 'break the bank', '/breɪk ðə bæŋk/', 'tốn quá nhiều tiền', 'Thường ở thể phủ định: "won\'t break the bank".', [['cost a fortune', 'tốn cả gia tài'], ['be expensive', 'đắt']], [
      ["A weekend trip won't break the bank.", 'Một chuyến đi cuối tuần sẽ không tốn kém lắm đâu.', 'break the bank'],
      ['You can eat well here without breaking the bank.', 'Ở đây bạn có thể ăn ngon mà không tốn nhiều tiền.', 'breaking the bank'],
    ]],
    ['on-sale', 'on sale', '/ɒn seɪl/', 'đang giảm giá', 'Anh–Mỹ; cũng có nghĩa "đang được bán".', [['discounted', 'được giảm giá'], ['marked down', 'đã hạ giá']], [
      ['These shoes are on sale for half price.', 'Đôi giày này đang giảm nửa giá.', 'on sale'],
      ['I only buy clothes when they are on sale.', 'Tôi chỉ mua quần áo khi được giảm giá.', 'on sale'],
    ]],
    ['window-shopping', 'go window shopping', '/ɡəʊ ˈwɪndəʊ ˌʃɒpɪŋ/', 'đi ngắm hàng (không mua)', 'Dạo phố xem đồ cho vui.', [['browse', 'xem lướt'], ['just looking', 'chỉ xem thôi']], [
      ['We went window shopping at the mall.', 'Chúng tôi đi ngắm đồ ở trung tâm thương mại.', 'window shopping'],
      ["I'm broke, so let's just go window shopping.", 'Mình hết tiền rồi, đi ngắm đồ thôi nhé.', 'go window shopping'],
    ]],
    ['pay-off', 'pay off', '/peɪ ɒf/', 'trả hết (nợ); được đền đáp', 'Nghĩa 2: "Hard work pays off."', [['clear a debt', 'xóa nợ'], ['be worth it', 'đáng công']], [
      ['It took him five years to pay off his loan.', 'Anh ấy mất năm năm để trả hết khoản vay.', 'pay off'],
      ['All that practice finally paid off.', 'Bao công luyện tập cuối cùng cũng được đền đáp.', 'paid off'],
    ]],
  ]),
  ...deck('deck-suc-khoe', [
    ['work-out', 'work out', '/wɜːk aʊt/', 'tập thể dục', 'Danh từ: "workout".', [['exercise', 'trung tính'], ['train', 'tập luyện']], [
      ['I work out at the gym three times a week.', 'Tôi tập gym ba lần một tuần.', 'work out'],
      ['She worked out every morning before work.', 'Cô ấy tập thể dục mỗi sáng trước khi đi làm.', 'worked out'],
    ]],
    ['get-in-shape', 'get in shape', '/ɡet ɪn ʃeɪp/', 'lấy lại vóc dáng, khỏe mạnh', 'Trái nghĩa: "out of shape".', [['get fit', 'khỏe lên'], ['tone up', 'săn chắc cơ']], [
      ['I want to get in shape before summer.', 'Tôi muốn lấy lại vóc dáng trước mùa hè.', 'get in shape'],
      ['Swimming is a great way to get in shape.', 'Bơi là cách tuyệt vời để khỏe mạnh.', 'get in shape'],
    ]],
    ['catch-cold', 'catch a cold', '/kætʃ ə kəʊld/', 'bị cảm lạnh', 'Không nói "take a cold".', [['come down with a cold', 'bắt đầu bị cảm'], ['get sick', 'bị ốm']], [
      ['Wear a jacket or you will catch a cold.', 'Mặc áo khoác vào kẻo cảm lạnh.', 'catch a cold'],
      ['I caught a cold after the rain.', 'Tôi bị cảm sau trận mưa.', 'caught a cold'],
    ]],
    ['cut-down-on', 'cut down on', '/kʌt daʊn ɒn/', 'cắt giảm', 'Giảm dần, không bỏ hẳn.', [['reduce', 'trang trọng'], ['cut back on', 'gần như đồng nghĩa']], [
      ['The doctor told me to cut down on sugar.', 'Bác sĩ bảo tôi giảm đường.', 'cut down on'],
      ["I'm trying to cut down on coffee.", 'Tôi đang cố uống ít cà phê lại.', 'cut down on'],
    ]],
    ['take-a-break', 'take a break', '/teɪk ə breɪk/', 'nghỉ giải lao', 'Có thể nói "take a short break".', [['have a rest', 'nghỉ ngơi'], ['take five', 'nghỉ năm phút, khẩu ngữ']], [
      ["You've been working for hours. Take a break.", 'Bạn làm mấy tiếng rồi. Nghỉ chút đi.', 'Take a break'],
      ['We took a break for lunch.', 'Chúng tôi nghỉ ăn trưa.', 'took a break'],
    ]],
    ['enough-sleep', 'get enough sleep', '/ɡet ɪˈnʌf sliːp/', 'ngủ đủ giấc', 'Hay đi với "every night".', [['sleep well', 'ngủ ngon'], ['get a good night\'s sleep', 'ngủ một giấc ngon']], [
      ["Teenagers often don't get enough sleep.", 'Thanh thiếu niên thường không ngủ đủ giấc.', 'get enough sleep'],
      ['Make sure you get enough sleep before the exam.', 'Nhớ ngủ đủ giấc trước kỳ thi.', 'get enough sleep'],
    ]],
    ['on-a-diet', 'be on a diet', '/biː ɒn ə ˈdaɪət/', 'đang ăn kiêng', 'Bắt đầu ăn kiêng: "go on a diet".', [['watch what you eat', 'chú ý ăn uống'], ['diet', 'động từ, ăn kiêng']], [
      ["No cake for me, thanks. I'm on a diet.", 'Cảm ơn, mình không ăn bánh. Mình đang ăn kiêng.', 'on a diet'],
      ['She has been on a diet for a month.', 'Cô ấy ăn kiêng được một tháng rồi.', 'on a diet'],
    ]],
    ['recover-from', 'recover from', '/rɪˈkʌvə frəm/', 'hồi phục sau', 'Dùng cho bệnh, chấn thương, cú sốc.', [['get over', 'khẩu ngữ'], ['bounce back from', 'nhanh chóng hồi phục']], [
      ['He is still recovering from the flu.', 'Anh ấy vẫn đang hồi phục sau cúm.', 'recovering from'],
      ['It took months to recover from the injury.', 'Phải mất nhiều tháng mới hồi phục chấn thương.', 'recover from'],
    ]],
    ['stay-hydrated', 'stay hydrated', '/steɪ haɪˈdreɪtɪd/', 'uống đủ nước', 'Hay gặp trong lời khuyên sức khỏe.', [['drink plenty of water', 'uống nhiều nước'], ['keep hydrated', 'gần như đồng nghĩa']], [
      ['Stay hydrated during the hike.', 'Nhớ uống đủ nước khi leo núi.', 'Stay hydrated'],
      ['It is important to stay hydrated in hot weather.', 'Uống đủ nước khi trời nóng rất quan trọng.', 'stay hydrated'],
    ]],
    ['keep-fit', 'keep fit', '/kiːp fɪt/', 'giữ dáng, giữ sức khỏe', 'Anh–Anh phổ biến.', [['stay in shape', 'giữ vóc dáng'], ['stay healthy', 'giữ sức khỏe']], [
      ['My grandma does yoga to keep fit.', 'Bà tôi tập yoga để giữ sức khỏe.', 'keep fit'],
      ['Walking is an easy way to keep fit.', 'Đi bộ là cách đơn giản để giữ dáng.', 'keep fit'],
    ]],
    ['see-doctor', 'see a doctor', '/siː ə ˈdɒktə/', 'đi khám bác sĩ', 'Không nói "meet a doctor".', [['get checked out', 'đi kiểm tra'], ['consult a doctor', 'trang trọng']], [
      ['If the pain continues, see a doctor.', 'Nếu vẫn đau, hãy đi khám bác sĩ.', 'see a doctor'],
      ['I saw a doctor about my back.', 'Tôi đã đi khám bác sĩ vì đau lưng.', 'saw a doctor'],
    ]],
  ]),
  ...deck('deck-hoc-tap', [
    ['hang-of', 'get the hang of', '/ɡet ðə hæŋ əv/', 'quen tay, nắm được cách làm', 'Sau một thời gian luyện tập.', [['master', 'thành thạo'], ['get used to', 'quen với']], [
      ["Driving is hard at first, but you'll get the hang of it.", 'Lúc đầu lái xe khó, nhưng rồi bạn sẽ quen tay.', 'get the hang of'],
      ['I finally got the hang of this software.', 'Cuối cùng tôi cũng dùng thạo phần mềm này.', 'got the hang of'],
    ]],
    ['by-heart', 'learn by heart', '/lɜːn baɪ hɑːt/', 'học thuộc lòng', 'Có thể chèn tân ngữ: "learn a poem by heart".', [['memorise', 'ghi nhớ'], ['know by heart', 'thuộc lòng']], [
      ['We had to learn the poem by heart.', 'Chúng tôi phải học thuộc lòng bài thơ.', 'by heart'],
      ['Learn these phrases by heart before the trip.', 'Hãy học thuộc các cụm này trước chuyến đi.', 'by heart'],
    ]],
    ['brush-up-on', 'brush up on', '/brʌʃ ʌp ɒn/', 'ôn lại, trau dồi lại', 'Kỹ năng đã học nhưng bị mai một.', [['revise', 'ôn tập, Anh–Anh'], ['refresh', 'làm mới kiến thức']], [
      ['I need to brush up on my French before Paris.', 'Tôi cần ôn lại tiếng Pháp trước khi đến Paris.', 'brush up on'],
      ['She brushed up on her maths for the test.', 'Cô ấy ôn lại toán cho bài kiểm tra.', 'brushed up on'],
    ]],
    ['fall-behind', 'fall behind', '/fɔːl bɪˈhaɪnd/', 'bị tụt lại, chậm hơn', 'Trong học tập hoặc tiến độ.', [['lag behind', 'tụt hậu'], ['get behind', 'chậm trễ']], [
      ['He fell behind after missing two weeks of school.', 'Cậu ấy bị tụt lại sau khi nghỉ học hai tuần.', 'fell behind'],
      ["Don't fall behind with your reading.", 'Đừng để bị chậm phần bài đọc nhé.', 'fall behind'],
    ]],
    ['keep-up-with', 'keep up with', '/kiːp ʌp wɪð/', 'theo kịp', 'Trái nghĩa với "fall behind".', [['stay on top of', 'nắm vững'], ['match the pace of', 'theo kịp tốc độ']], [
      ['It is hard to keep up with the teacher.', 'Thật khó theo kịp thầy giáo.', 'keep up with'],
      ['She reads the news to keep up with current events.', 'Cô ấy đọc báo để nắm bắt thời sự.', 'keep up with'],
    ]],
    ['flying-colours', 'pass with flying colours', '/pɑːs wɪð ˈflaɪɪŋ ˈkʌləz/', 'đỗ với điểm cao', 'Anh–Mỹ viết "colors".', [['ace', 'làm bài xuất sắc'], ['pass easily', 'đỗ dễ dàng']], [
      ['She passed the exam with flying colours.', 'Cô ấy đỗ kỳ thi với điểm rất cao.', 'with flying colours'],
      ['Study hard and you will pass with flying colours.', 'Học chăm thì bạn sẽ đỗ điểm cao.', 'pass with flying colours'],
    ]],
    ['hand-in', 'hand in', '/hænd ɪn/', 'nộp (bài)', 'Anh–Mỹ hay dùng "turn in".', [['submit', 'trang trọng'], ['turn in', 'Anh–Mỹ']], [
      ['Please hand in your essays by Friday.', 'Các em nộp bài luận trước thứ Sáu nhé.', 'hand in'],
      ['I handed in my assignment late.', 'Tôi nộp bài tập muộn.', 'handed in'],
    ]],
    ['take-notes', 'take notes', '/teɪk nəʊts/', 'ghi chép', 'Không nói "write notes" trong ngữ cảnh lớp học.', [['jot down', 'ghi nhanh'], ['write down', 'viết ra']], [
      ['Take notes during the lecture.', 'Hãy ghi chép trong suốt bài giảng.', 'Take notes'],
      ['She took notes on every chapter.', 'Cô ấy ghi chép từng chương.', 'took notes'],
    ]],
    ['pick-up', 'pick up', '/pɪk ʌp/', 'học lỏm, tiếp thu tự nhiên', 'Học không cần cố gắng nhiều.', [['learn', 'học'], ['acquire', 'trang trọng']], [
      ['Kids pick up languages quickly.', 'Trẻ con học ngoại ngữ rất nhanh.', 'pick up'],
      ['I picked up some Spanish while living in Madrid.', 'Tôi học được ít tiếng Tây Ban Nha hồi sống ở Madrid.', 'picked up'],
    ]],
    ['do-research', 'do research on', '/duː rɪˈsɜːtʃ ɒn/', 'nghiên cứu về', '"research" không đếm được; không nói "a research".', [['research', 'động từ'], ['look into', 'tìm hiểu']], [
      ['She is doing research on climate change.', 'Cô ấy đang nghiên cứu về biến đổi khí hậu.', 'doing research on'],
      ['Do some research on the company before the interview.', 'Hãy tìm hiểu về công ty trước buổi phỏng vấn.', 'research on'],
    ]],
    ['hit-books', 'hit the books', '/hɪt ðə bʊks/', 'lao vào học', 'Thân mật, Anh–Mỹ.', [['study hard', 'học chăm'], ['cram', 'học nhồi']], [
      ['Exams are next week, so I need to hit the books.', 'Tuần sau thi rồi nên tôi phải lao vào học.', 'hit the books'],
      ['He hit the books all weekend.', 'Anh ấy cày sách cả cuối tuần.', 'hit the books'],
    ]],
  ]),
]
