import type { LanguageCode } from '@/context/language-context';

export const TRANSLATIONS: Partial<Record<LanguageCode, Record<string, string>>> = {
  es: {
    // ── Tab bar ──────────────────────────────────────────────────────────
    'Map': 'Mapa',
    'Plan': 'Planificar',
    'Calendar': 'Calendario',
    'More': 'Más',
    'Schedule': 'Horario',

    // ── More / Settings (AggieSpirit) ───────────────────────────────────
    'Theme': 'Tema',
    'Light, dark, or follow system': 'Claro, oscuro, o seguir el sistema',
    'Accessibility': 'Accesibilidad',
    'Icon/text size, contrast, and motion': 'Tamaño de íconos/texto, contraste y movimiento',
    'Favorite Routes': 'Rutas favoritas',
    'Pin routes to the top of the selector': 'Fija rutas en la parte superior del selector',
    'Notifications': 'Notificaciones',
    'Enable alerts for delays and reroutes': 'Activa alertas de retrasos y desvíos',
    'Service Disruptions': 'Interrupciones de servicio',
    'Construction reroutes and closures': 'Desvíos por construcción y cierres',
    'Help Guide': 'Guía de ayuda',
    'Stop types and tips for riding the bus': 'Tipos de parada y consejos para viajar en autobús',
    'Unit Codes': 'Códigos de unidad',
    '(Experimental)': '(Experimental)',
    "Shows each unit's letter code (Alpha, Bravo, ...).": 'Muestra el código de letra de cada unidad (Alpha, Bravo, ...).',
    'Brazos Transit District': 'Brazos Transit District',
    "Switch to BTD's bus service": 'Cambiar al servicio de autobús de BTD',
    'Load into BTD': 'Iniciar en BTD',
    'Open straight to BTD instead of the map when you start the app':
      'Abre directamente en BTD en lugar del mapa al iniciar la app',
    'Replay Tutorial': 'Repetir tutorial',
    'Watch the first-launch walkthrough again': 'Vuelve a ver la guía inicial',

    // ── More (BTD) ───────────────────────────────────────────────────────
    'Fares, tickets, and contact info': 'Tarifas, boletos e información de contacto',
    'AggieSpirit Buses': 'Autobuses AggieSpirit',
    "Switch back to TAMU's bus service": 'Volver al servicio de autobús de TAMU',
    "Switches back to TAMU's bus service": 'Vuelve al servicio de autobús de TAMU',
    "Open straight to BTD instead of the map when you start the app.":
      'Abre directamente en BTD en lugar del mapa al iniciar la app.',
    "Opens the app directly to BTD's map on launch": 'Abre la app directamente en el mapa de BTD al iniciar',
    'Info': 'Información',

    // ── Theme screen ─────────────────────────────────────────────────────
    'System': 'Sistema',
    'Follow device settings': 'Seguir configuración del dispositivo',
    'Light': 'Claro',
    'Always use light theme': 'Usar siempre el tema claro',
    'Dark': 'Oscuro',
    'Always use dark theme': 'Usar siempre el tema oscuro',

    // ── Map provider screen ─────────────────────────────────────────────
    'Apple Maps': 'Apple Maps',
    'Default': 'Predeterminado',
    'Google Maps': 'Google Maps',
    'Alternative': 'Alternativa',

    // ── Accessibility screen ────────────────────────────────────────────
    'Icon Size': 'Tamaño de íconos',
    'Scales map markers and tab bar icons. Changing this will close any routes you have open on the map.':
      'Ajusta el tamaño de los marcadores del mapa y los íconos de la barra. Cambiar esto cerrará las rutas abiertas en el mapa.',
    'Text Size': 'Tamaño de texto',
    'Scales text in the More menu and key screens.': 'Ajusta el tamaño del texto en el menú Más y pantallas clave.',
    'High Contrast': 'Alto contraste',
    'Stronger contrast between text, backgrounds, and borders.': 'Mayor contraste entre texto, fondos y bordes.',
    'Reduce Motion': 'Reducir movimiento',
    'Shortens or removes animations like the tour and panel slides.':
      'Acorta o elimina animaciones como el recorrido y las transiciones de paneles.',
    'Extra Small': 'Extra pequeño',
    'Small': 'Pequeño',
    'Large': 'Grande',
    'Extra Large': 'Extra grande',
    'Min': 'Mín',
    'Max': 'Máx',

    // ── Language screen (new) ───────────────────────────────────────────
    'Language': 'Idioma',
    'Choose your language': 'Elige tu idioma',
    'Machine-translated. Wording may be imperfect or occasionally inaccurate - route names, live bus data, and service alerts always show in English.':
      'Traducido automáticamente. El texto puede ser imperfecto o a veces inexacto - los nombres de rutas, los datos de autobuses en vivo y las alertas de servicio siempre se muestran en inglés.',

    // ── Favorites screen ─────────────────────────────────────────────────
    'Favorited routes appear at the top of the route selector on the map.':
      'Las rutas favoritas aparecen en la parte superior del selector de rutas en el mapa.',

    // ── Help Guide ───────────────────────────────────────────────────────
    'STOP TYPES': 'TIPOS DE PARADA',
    'Normal Stop': 'Parada normal',
    "Just a regular stop on the route. The driver will stop if a passenger requests the stop or if someone's waiting to board.":
      'Una parada regular en la ruta. El conductor se detendrá si un pasajero lo solicita o si alguien espera para subir.',
    'Timepoint': 'Punto de control',
    "Similar to a regular stop, but if the driver is running early, they'll hold here until the scheduled leave time.":
      'Similar a una parada regular, pero si el conductor va adelantado, esperará aquí hasta la hora programada de salida.',
    'Temporary Stop': 'Parada temporal',
    'Like a normal stop, but not permanent. Usually for construction or temporary route changes. Sometimes marked with an A-frame sign, but not always.':
      'Como una parada normal, pero no permanente. Generalmente por construcción o cambios temporales de ruta. A veces marcada con un letrero, pero no siempre.',
    'HOW TO RIDE': 'CÓMO VIAJAR',
    'Stop Request': 'Solicitud de parada',
    "Pull the cord or push the strip when you hear your stop being announced. Otherwise, the driver will keep driving and can only drop you off at the next stop.":
      'Tira del cordón o presiona la franja cuando escuches anunciar tu parada. De lo contrario, el conductor seguirá y solo podrá dejarte en la siguiente parada.',
    'Some routes share stops on the other side of the road. It might be faster or easier to wait for the bus to come back around to the adjacent stop.':
      'Algunas rutas comparten paradas al otro lado de la calle. Puede ser más rápido esperar a que el autobús regrese a la parada adyacente.',
    'Not Every Stop Is Automatic': 'No todas las paradas son automáticas',
    'Plan Ahead': 'Planifica con anticipación',
    "Leave earlier than you think you need to, especially during the beginning of the semester or peak riding times.":
      'Sal más temprano de lo que crees necesario, especialmente al inicio del semestre o en horas pico.',
    "Nobody knows exactly how timing will be affected by traffic, ridership, accidents, etc.":
      'Nadie sabe con exactitud cómo el tráfico, la afluencia de pasajeros, los accidentes, etc. afectarán los tiempos.',
    'Full Bus / "Another Bus Follows"': 'Autobús lleno / "Otro autobús sigue"',
    'Rush Hours': 'Horas pico',
    'Expect busses to be running late or full during rush hours: 7-8 AM, class changes, 3 PM, and 5 PM.':
      'Espera que los autobuses vayan retrasados o llenos en horas pico: 7-8 AM, cambios de clase, 3 PM y 5 PM.',
    'Mobility Devices & Bikes': 'Dispositivos de movilidad y bicicletas',
    'TIP': 'CONSEJO',

    // ── Service Disruptions ─────────────────────────────────────────────
    'No active service disruptions.': 'No hay interrupciones de servicio activas.',
    'All Routes': 'Todas las rutas',

    // ── Notifications ────────────────────────────────────────────────────
    'Enable Notifications': 'Activar notificaciones',
    'Required before any alerts (delays, detours, service news) can reach this device.':
      'Requerido antes de que cualquier alerta (retrasos, desvíos, noticias de servicio) pueda llegar a este dispositivo.',
    'Notifications are only available in English right now.':
      'Las notificaciones solo están disponibles en inglés por ahora.',
    'My Routes': 'Mis rutas',
    'Add a route to set up its alerts.': 'Agrega una ruta para configurar sus alertas.',
    'No routes added yet. Pick one below.': 'Aún no hay rutas agregadas. Elige una abajo.',
    'Notify me if running': 'Avisarme si va',
    'minutes late': 'minutos tarde',
    'Notify me during these times if the route is running late:':
      'Avisarme durante estos horarios si la ruta va retrasada:',
    'Always': 'Siempre',
    'Specific times': 'Horarios específicos',
    'From': 'Desde',
    'To': 'Hasta',
    'Add another window': 'Agregar otro horario',
    'Notify me about reroutes': 'Avisarme sobre desvíos',
    'Always sent right away, regardless of the schedule above.':
      'Siempre se envía de inmediato, sin importar el horario anterior.',
    'Add a route': 'Agregar una ruta',

    // ── Calendar ─────────────────────────────────────────────────────────
    'Previous month': 'Mes anterior',
    'Next month': 'Mes siguiente',
    'No Service': 'Sin servicio',
    'Gameday': 'Día de partido',
    'Summer': 'Verano',
    'Break': 'Receso',
    'Regular': 'Regular',
    'Charter': 'Chárter',
    'No scheduled transit changes today - normal posted hours apply.':
      'No hay cambios de tránsito programados hoy - aplican los horarios normales publicados.',
    'Close': 'Cerrar',

    // ── BTD Map ──────────────────────────────────────────────────────────
    'No routes selected': 'No hay rutas seleccionadas',
    'Running Today': 'En servicio hoy',
    'No Weekend Service': 'Sin servicio los fines de semana',

    // ── BTD Schedule ─────────────────────────────────────────────────────
    'Time points repeat every hour, on the same minutes, all day.':
      'Los puntos de control se repiten cada hora, en los mismos minutos, todo el día.',
    'Excluding holidays. No weekend service.': 'Excepto días festivos. Sin servicio los fines de semana.',
    'ROUTES': 'RUTAS',

    // ── BTD Info (fares) ────────────────────────────────────────────────
    'Fixed routes serving Bryan & College Station.': 'Rutas fijas que sirven a Bryan y College Station.',
    'FIXED ROUTE (ONE-WAY)': 'RUTA FIJA (UN SOLO VIAJE)',
    'TICKETS & PASSES': 'BOLETOS Y PASES',
    'REDUCED PASSES': 'PASES REDUCIDOS',
    'WHERE TO BUY TICKETS & PASSES': 'DÓNDE COMPRAR BOLETOS Y PASES',
    'General Public': 'Público en general',
    'Children (6-12)': 'Niños (6-12)',
    'Children under 6 (with paying customer)': 'Niños menores de 6 (con pasajero pagando)',
    'FREE': 'GRATIS',
    'Senior / Disabled*': 'Adulto mayor / Discapacitado*',
    'Medicare*': 'Medicare*',
    'Blinn / TAMU Students*': 'Estudiantes de Blinn / TAMU*',
    'Day Pass': 'Pase diario',
    'Unlimited trips in one day': 'Viajes ilimitados en un día',
    'Weekly Pass': 'Pase semanal',
    'Unlimited trips in 5 consecutive weekdays': 'Viajes ilimitados en 5 días hábiles consecutivos',
    'Monthly Pass': 'Pase mensual',
    'Unlimited trips in 31 consecutive days': 'Viajes ilimitados en 31 días consecutivos',
    'Ticket Book': 'Libreta de boletos',
    '40 one-way trips': '40 viajes sencillos',
    'MultiRide Pass': 'Pase MultiRide',
    '42 one-way trips': '42 viajes sencillos',
    'S&D PunchPass*': 'PunchPass S&D*',
    'Purchase over the phone': 'Comprar por teléfono',
    'Stand away from the curb until the bus is completely stopped.':
      'Mantente alejado de la acera hasta que el autobús se detenga por completo.',
    'Have exact fare ready - drivers do not make change.':
      'Ten el pago exacto listo - los conductores no dan cambio.',
    'Watch your step getting on and off the bus.': 'Ten cuidado al subir y bajar del autobús.',
    'Use the handrails and sit in a seat as soon as possible.':
      'Usa los pasamanos y siéntate lo antes posible.',
    "Don't let children play or stand on the seats.": 'No dejes que los niños jueguen o se paren en los asientos.',
    'Be courteous to other passengers.': 'Sé cortés con los demás pasajeros.',
    'No eating, drinking, smoking, or loud music.': 'No comer, beber, fumar, ni música alta.',
    'No profanity, racial, or vulgar comments.': 'No se permiten groserías ni comentarios ofensivos.',
    'Riding under the influence of alcohol or illegal drugs is prohibited.':
      'Está prohibido viajar bajo la influencia de alcohol o drogas ilegales.',
    'All buses are ADA wheelchair accessible (combined customer + mobility aid weight limit: 600 lbs).':
      'Todos los autobuses son accesibles para sillas de ruedas bajo la ADA (límite de peso combinado pasajero + dispositivo de movilidad: 600 lbs).',

    // ── Plan a Ride (both AggieSpirit + BTD) ────────────────────────────
    'Plan a Ride': 'Planificar un viaje',
    "This is an estimate from BTD's posted schedule. Buses run Monday-Friday, 5 AM-7 PM only.":
      'Esto es un estimado basado en el horario publicado de BTD. Los autobuses circulan de lunes a viernes, de 5 AM a 7 PM únicamente.',
    'Search a stop or address': 'Buscar una parada o dirección',
    'Clear search': 'Borrar búsqueda',
    'Choose on Map': 'Elegir en el mapa',
    'Swap': 'Intercambiar',
    'Leave after': 'Salir después de',
    'Arrive by': 'Llegar antes de',
    'Anytime': 'Cualquier hora',
    'No deadline': 'Sin límite',
    'TIMING': 'HORARIO',
    'Set a leave-after or arrive-by time (at least one is required).':
      'Establece una hora de salida o llegada (se requiere al menos una).',
    'Find Routes': 'Buscar rutas',
    'Set a leave-after or arrive-by time above to search.':
      'Establece una hora de salida o llegada arriba para buscar.',
    'View Route': 'Ver ruta',
    'Confirm Location': 'Confirmar ubicación',
    'Cancel': 'Cancelar',
    'Done': 'Listo',
    'Choose a date': 'Elegir una fecha',

    // ── Route / stop picker sheets ───────────────────────────────────────
    'Select Routes': 'Seleccionar rutas',
    'Dismiss route picker': 'Cerrar selector de rutas',

    // ── Common ────────────────────────────────────────────────────────────
    'Back': 'Atrás',
    'Loading…': 'Cargando…',
    'Search': 'Buscar',
  },

  zh: {
    // ── Tab bar ──────────────────────────────────────────────────────────
    'Map': '地图',
    'Plan': '规划',
    'Calendar': '日历',
    'More': '更多',
    'Schedule': '时刻表',

    // ── More / Settings (AggieSpirit) ───────────────────────────────────
    'Theme': '主题',
    'Light, dark, or follow system': '浅色、深色或跟随系统',
    'Accessibility': '辅助功能',
    'Icon/text size, contrast, and motion': '图标/文字大小、对比度和动效',
    'Favorite Routes': '收藏路线',
    'Pin routes to the top of the selector': '将路线固定在选择器顶部',
    'Notifications': '通知',
    'Enable alerts for delays and reroutes': '开启延误和改道提醒',
    'Service Disruptions': '服务中断',
    'Construction reroutes and closures': '施工改道与封闭',
    'Help Guide': '帮助指南',
    'Stop types and tips for riding the bus': '站点类型与乘车提示',
    'Unit Codes': '车辆代码',
    '(Experimental)': '（实验性）',
    "Shows each unit's letter code (Alpha, Bravo, ...).": '显示每辆车的字母代码（Alpha、Bravo……）。',
    'Brazos Transit District': 'Brazos Transit District',
    "Switch to BTD's bus service": '切换到 BTD 巴士服务',
    'Load into BTD': '启动时打开 BTD',
    'Open straight to BTD instead of the map when you start the app':
      '启动应用时直接打开 BTD，而不是地图',
    'Replay Tutorial': '重新查看教程',
    'Watch the first-launch walkthrough again': '再次观看首次启动引导',

    // ── More (BTD) ───────────────────────────────────────────────────────
    'Fares, tickets, and contact info': '票价、票券和联系方式',
    'AggieSpirit Buses': 'AggieSpirit 巴士',
    "Switch back to TAMU's bus service": '切换回 TAMU 巴士服务',
    "Switches back to TAMU's bus service": '切换回 TAMU 巴士服务',
    "Open straight to BTD instead of the map when you start the app.":
      '启动应用时直接打开 BTD，而不是地图。',
    "Opens the app directly to BTD's map on launch": '启动时直接打开 BTD 地图',
    'Info': '信息',

    // ── Theme screen ─────────────────────────────────────────────────────
    'System': '系统',
    'Follow device settings': '跟随设备设置',
    'Light': '浅色',
    'Always use light theme': '始终使用浅色主题',
    'Dark': '深色',
    'Always use dark theme': '始终使用深色主题',

    // ── Map provider screen ─────────────────────────────────────────────
    'Apple Maps': 'Apple 地图',
    'Default': '默认',
    'Google Maps': 'Google 地图',
    'Alternative': '备选',

    // ── Accessibility screen ────────────────────────────────────────────
    'Icon Size': '图标大小',
    'Scales map markers and tab bar icons. Changing this will close any routes you have open on the map.':
      '调整地图标记和标签栏图标的大小。更改此设置将关闭地图上已打开的路线。',
    'Text Size': '文字大小',
    'Scales text in the More menu and key screens.': '调整“更多”菜单及主要界面的文字大小。',
    'High Contrast': '高对比度',
    'Stronger contrast between text, backgrounds, and borders.': '增强文字、背景和边框之间的对比度。',
    'Reduce Motion': '减弱动效',
    'Shortens or removes animations like the tour and panel slides.':
      '缩短或移除引导教程和面板滑动等动画效果。',
    'Extra Small': '极小',
    'Small': '小',
    'Large': '大',
    'Extra Large': '极大',
    'Min': '最小',
    'Max': '最大',

    // ── Language screen (new) ───────────────────────────────────────────
    'Language': '语言',
    'Choose your language': '选择语言',
    'Machine-translated. Wording may be imperfect or occasionally inaccurate - route names, live bus data, and service alerts always show in English.':
      '本翻译由机器完成，措辞可能不完善或偶有不准确之处 —— 路线名称、实时巴士数据和服务提醒始终以英文显示。',

    // ── Favorites screen ─────────────────────────────────────────────────
    'Favorited routes appear at the top of the route selector on the map.':
      '收藏的路线会显示在地图路线选择器的顶部。',

    // ── Help Guide ───────────────────────────────────────────────────────
    'STOP TYPES': '站点类型',
    'Normal Stop': '普通站点',
    "Just a regular stop on the route. The driver will stop if a passenger requests the stop or if someone's waiting to board.":
      '路线上的普通站点。乘客提出下车请求或有人等待上车时，司机会停车。',
    'Timepoint': '时间控制点',
    "Similar to a regular stop, but if the driver is running early, they'll hold here until the scheduled leave time.":
      '与普通站点类似，但如果司机提前到达，会在此等待至预定发车时间。',
    'Temporary Stop': '临时站点',
    'Like a normal stop, but not permanent. Usually for construction or temporary route changes. Sometimes marked with an A-frame sign, but not always.':
      '与普通站点类似，但并非永久性站点，通常因施工或临时路线变更而设置，有时会有指示牌标示，但并非总是如此。',
    'HOW TO RIDE': '乘车指南',
    'Stop Request': '下车请求',
    "Pull the cord or push the strip when you hear your stop being announced. Otherwise, the driver will keep driving and can only drop you off at the next stop.":
      '听到播报您要下车的站点时，拉动拉绳或按压按钮。否则司机会继续行驶，只能在下一站让您下车。',
    'Some routes share stops on the other side of the road. It might be faster or easier to wait for the bus to come back around to the adjacent stop.':
      '有些路线在马路对面共用站点，等巴士绕回附近站点有时会更快或更方便。',
    'Not Every Stop Is Automatic': '并非每站都会自动停靠',
    'Plan Ahead': '提前规划',
    "Leave earlier than you think you need to, especially during the beginning of the semester or peak riding times.":
      '出发时间要比预想的更早，尤其是在学期初或乘车高峰期。',
    "Nobody knows exactly how timing will be affected by traffic, ridership, accidents, etc.":
      '交通、客流量、事故等因素对时刻的影响难以精确预测。',
    'Full Bus / "Another Bus Follows"': '客满巴士 / “后续有车”',
    'Rush Hours': '高峰时段',
    'Expect busses to be running late or full during rush hours: 7-8 AM, class changes, 3 PM, and 5 PM.':
      '高峰时段（上午 7-8 点、换课时间、下午 3 点和 5 点）巴士可能延误或客满。',
    'Mobility Devices & Bikes': '助行设备与自行车',
    'TIP': '提示',

    // ── Service Disruptions ─────────────────────────────────────────────
    'No active service disruptions.': '目前没有服务中断。',
    'All Routes': '所有路线',

    // ── Notifications ────────────────────────────────────────────────────
    'Enable Notifications': '启用通知',
    'Required before any alerts (delays, detours, service news) can reach this device.':
      '需先启用，本设备才能接收任何提醒（延误、改道、服务通知）。',
    'Notifications are only available in English right now.':
      '通知目前仅提供英文版本。',
    'My Routes': '我的路线',
    'Add a route to set up its alerts.': '添加路线以设置提醒。',
    'No routes added yet. Pick one below.': '尚未添加路线，请在下方选择。',
    'Notify me if running': '延误提醒阈值',
    'minutes late': '分钟',
    'Notify me during these times if the route is running late:':
      '在以下时间段内，若路线延误则提醒我：',
    'Always': '始终',
    'Specific times': '指定时段',
    'From': '从',
    'To': '至',
    'Add another window': '添加另一个时段',
    'Notify me about reroutes': '改道时提醒我',
    'Always sent right away, regardless of the schedule above.':
      '无论以上时间设置如何，此提醒始终立即发送。',
    'Add a route': '添加路线',

    // ── Calendar ─────────────────────────────────────────────────────────
    'Previous month': '上个月',
    'Next month': '下个月',
    'No Service': '无服务',
    'Gameday': '比赛日',
    'Summer': '暑期',
    'Break': '假期',
    'Regular': '常规',
    'Charter': '包车',
    'No scheduled transit changes today - normal posted hours apply.':
      '今日无已排定的运营变更 —— 按正常公布时间运行。',
    'Close': '关闭',

    // ── BTD Map ──────────────────────────────────────────────────────────
    'No routes selected': '未选择路线',
    'Running Today': '今日运营',
    'No Weekend Service': '周末无服务',

    // ── BTD Schedule ─────────────────────────────────────────────────────
    'Time points repeat every hour, on the same minutes, all day.':
      '时间控制点全天每小时在相同分钟重复。',
    'Excluding holidays. No weekend service.': '节假日除外，周末无服务。',
    'ROUTES': '路线',

    // ── BTD Info (fares) ────────────────────────────────────────────────
    'Fixed routes serving Bryan & College Station.': '为 Bryan 和 College Station 提供服务的固定路线。',
    'FIXED ROUTE (ONE-WAY)': '固定路线（单程）',
    'TICKETS & PASSES': '票券与套票',
    'REDUCED PASSES': '优惠套票',
    'WHERE TO BUY TICKETS & PASSES': '购票地点',
    'General Public': '普通乘客',
    'Children (6-12)': '儿童（6-12 岁）',
    'Children under 6 (with paying customer)': '6 岁以下儿童（须与付费乘客同行）',
    'FREE': '免费',
    'Senior / Disabled*': '老年人 / 残障人士*',
    'Medicare*': 'Medicare 持有者*',
    'Blinn / TAMU Students*': 'Blinn / TAMU 学生*',
    'Day Pass': '日票',
    'Unlimited trips in one day': '单日无限次乘坐',
    'Weekly Pass': '周票',
    'Unlimited trips in 5 consecutive weekdays': '连续 5 个工作日内无限次乘坐',
    'Monthly Pass': '月票',
    'Unlimited trips in 31 consecutive days': '连续 31 天内无限次乘坐',
    'Ticket Book': '票本',
    '40 one-way trips': '40 次单程',
    'MultiRide Pass': 'MultiRide 套票',
    '42 one-way trips': '42 次单程',
    'S&D PunchPass*': 'S&D 打孔票*',
    'Purchase over the phone': '电话购票',
    'Stand away from the curb until the bus is completely stopped.':
      '巴士完全停稳前请远离路缘。',
    'Have exact fare ready - drivers do not make change.':
      '请备好准确票价 —— 司机不找零。',
    'Watch your step getting on and off the bus.': '上下车时请注意脚下台阶。',
    'Use the handrails and sit in a seat as soon as possible.':
      '请扶好扶手，并尽快就座。',
    "Don't let children play or stand on the seats.": '请勿让儿童在座位上玩耍或站立。',
    'Be courteous to other passengers.': '请礼貌对待其他乘客。',
    'No eating, drinking, smoking, or loud music.': '车内禁止饮食、吸烟及外放音乐。',
    'No profanity, racial, or vulgar comments.': '禁止使用脏话、种族歧视或粗俗言语。',
    'Riding under the influence of alcohol or illegal drugs is prohibited.':
      '禁止在酒精或违禁药物影响下乘车。',
    'All buses are ADA wheelchair accessible (combined customer + mobility aid weight limit: 600 lbs).':
      '所有巴士均符合 ADA 无障碍轮椅标准（乘客与助行设备合计重量限制为 600 磅）。',

    // ── Plan a Ride (both AggieSpirit + BTD) ────────────────────────────
    'Plan a Ride': '规划行程',
    "This is an estimate from BTD's posted schedule. Buses run Monday-Friday, 5 AM-7 PM only.":
      '此为根据 BTD 公布时刻表的预估。巴士仅在周一至周五上午 5 点至晚上 7 点运行。',
    'Search a stop or address': '搜索站点或地址',
    'Clear search': '清除搜索',
    'Choose on Map': '在地图上选择',
    'Swap': '交换',
    'Leave after': '不早于',
    'Arrive by': '不晚于',
    'Anytime': '任意时间',
    'No deadline': '无截止时间',
    'TIMING': '时间设置',
    'Set a leave-after or arrive-by time (at least one is required).':
      '设置出发或到达时间（至少填写一项）。',
    'Find Routes': '查找路线',
    'Set a leave-after or arrive-by time above to search.':
      '请先在上方设置出发或到达时间再进行搜索。',
    'View Route': '查看路线',
    'Confirm Location': '确认位置',
    'Cancel': '取消',
    'Done': '完成',
    'Choose a date': '选择日期',

    // ── Route / stop picker sheets ───────────────────────────────────────
    'Select Routes': '选择路线',
    'Dismiss route picker': '关闭路线选择器',

    // ── Common ────────────────────────────────────────────────────────────
    'Back': '返回',
    'Loading…': '加载中…',
    'Search': '搜索',
  },

  hi: {
    // ── Tab bar ──────────────────────────────────────────────────────────
    'Map': 'मानचित्र',
    'Plan': 'योजना',
    'Calendar': 'कैलेंडर',
    'More': 'अधिक',
    'Schedule': 'समय सारणी',

    // ── More / Settings (AggieSpirit) ───────────────────────────────────
    'Theme': 'थीम',
    'Light, dark, or follow system': 'हल्का, गहरा, या सिस्टम के अनुसार',
    'Accessibility': 'सुगम्यता',
    'Icon/text size, contrast, and motion': 'आइकन/टेक्स्ट आकार, कंट्रास्ट और मोशन',
    'Favorite Routes': 'पसंदीदा रूट',
    'Pin routes to the top of the selector': 'रूट को चयनकर्ता के शीर्ष पर पिन करें',
    'Notifications': 'सूचनाएं',
    'Enable alerts for delays and reroutes': 'देरी और मार्ग परिवर्तन के लिए अलर्ट सक्षम करें',
    'Service Disruptions': 'सेवा में व्यवधान',
    'Construction reroutes and closures': 'निर्माण कार्य के कारण मार्ग परिवर्तन और बंद',
    'Help Guide': 'सहायता गाइड',
    'Stop types and tips for riding the bus': 'स्टॉप के प्रकार और बस में यात्रा के सुझाव',
    'Unit Codes': 'यूनिट कोड',
    '(Experimental)': '(प्रायोगिक)',
    "Shows each unit's letter code (Alpha, Bravo, ...).": 'प्रत्येक यूनिट का अक्षर कोड दिखाता है (Alpha, Bravo, ...)।',
    'Brazos Transit District': 'Brazos Transit District',
    "Switch to BTD's bus service": 'BTD की बस सेवा पर स्विच करें',
    'Load into BTD': 'BTD में सीधे खोलें',
    'Open straight to BTD instead of the map when you start the app':
      'ऐप शुरू करते समय मानचित्र के बजाय सीधे BTD खोलें',
    'Replay Tutorial': 'ट्यूटोरियल फिर से देखें',
    'Watch the first-launch walkthrough again': 'पहली बार वाला परिचय फिर से देखें',

    // ── More (BTD) ───────────────────────────────────────────────────────
    'Fares, tickets, and contact info': 'किराया, टिकट, और संपर्क जानकारी',
    'AggieSpirit Buses': 'AggieSpirit बसें',
    "Switch back to TAMU's bus service": 'TAMU की बस सेवा पर वापस स्विच करें',
    "Switches back to TAMU's bus service": 'TAMU की बस सेवा पर वापस स्विच करता है',
    "Open straight to BTD instead of the map when you start the app.":
      'ऐप शुरू करते समय मानचित्र के बजाय सीधे BTD खोलें।',
    "Opens the app directly to BTD's map on launch": 'शुरू होने पर ऐप सीधे BTD के मानचित्र पर खुलती है',
    'Info': 'जानकारी',

    // ── Theme screen ─────────────────────────────────────────────────────
    'System': 'सिस्टम',
    'Follow device settings': 'डिवाइस सेटिंग्स के अनुसार',
    'Light': 'हल्का',
    'Always use light theme': 'हमेशा हल्की थीम का उपयोग करें',
    'Dark': 'गहरा',
    'Always use dark theme': 'हमेशा गहरी थीम का उपयोग करें',

    // ── Map provider screen ─────────────────────────────────────────────
    'Apple Maps': 'Apple Maps',
    'Default': 'डिफ़ॉल्ट',
    'Google Maps': 'Google Maps',
    'Alternative': 'विकल्प',

    // ── Accessibility screen ────────────────────────────────────────────
    'Icon Size': 'आइकन आकार',
    'Scales map markers and tab bar icons. Changing this will close any routes you have open on the map.':
      'मानचित्र मार्कर और टैब बार आइकन का आकार बदलता है। इसे बदलने पर मानचित्र पर खुले सभी रूट बंद हो जाएंगे।',
    'Text Size': 'टेक्स्ट आकार',
    'Scales text in the More menu and key screens.': '"अधिक" मेनू और मुख्य स्क्रीन में टेक्स्ट का आकार बदलता है।',
    'High Contrast': 'उच्च कंट्रास्ट',
    'Stronger contrast between text, backgrounds, and borders.': 'टेक्स्ट, पृष्ठभूमि, और बॉर्डर के बीच अधिक कंट्रास्ट।',
    'Reduce Motion': 'मोशन कम करें',
    'Shortens or removes animations like the tour and panel slides.':
      'टूर और पैनल स्लाइड जैसी एनिमेशन को छोटा या हटाता है।',
    'Extra Small': 'अतिरिक्त छोटा',
    'Small': 'छोटा',
    'Large': 'बड़ा',
    'Extra Large': 'अतिरिक्त बड़ा',
    'Min': 'न्यूनतम',
    'Max': 'अधिकतम',

    // ── Language screen (new) ───────────────────────────────────────────
    'Language': 'भाषा',
    'Choose your language': 'अपनी भाषा चुनें',
    'Machine-translated. Wording may be imperfect or occasionally inaccurate - route names, live bus data, and service alerts always show in English.':
      'यह मशीन-अनुवादित है। शब्द चयन अपूर्ण या कभी-कभी गलत हो सकता है - रूट के नाम, लाइव बस डेटा, और सेवा अलर्ट हमेशा अंग्रेज़ी में दिखाए जाते हैं।',

    // ── Favorites screen ─────────────────────────────────────────────────
    'Favorited routes appear at the top of the route selector on the map.':
      'पसंदीदा रूट मानचित्र के रूट चयनकर्ता में सबसे ऊपर दिखाई देते हैं।',

    // ── Help Guide ───────────────────────────────────────────────────────
    'STOP TYPES': 'स्टॉप के प्रकार',
    'Normal Stop': 'सामान्य स्टॉप',
    "Just a regular stop on the route. The driver will stop if a passenger requests the stop or if someone's waiting to board.":
      'रूट पर एक सामान्य स्टॉप। यदि कोई यात्री रुकने का अनुरोध करता है या कोई चढ़ने के लिए प्रतीक्षा कर रहा है, तो ड्राइवर रुकेगा।',
    'Timepoint': 'समय बिंदु',
    "Similar to a regular stop, but if the driver is running early, they'll hold here until the scheduled leave time.":
      'सामान्य स्टॉप जैसा ही, लेकिन अगर ड्राइवर समय से पहले पहुंच जाता है, तो वह निर्धारित प्रस्थान समय तक यहां रुकेगा।',
    'Temporary Stop': 'अस्थायी स्टॉप',
    'Like a normal stop, but not permanent. Usually for construction or temporary route changes. Sometimes marked with an A-frame sign, but not always.':
      'सामान्य स्टॉप जैसा, पर स्थायी नहीं। आमतौर पर निर्माण कार्य या अस्थायी रूट परिवर्तन के लिए। कभी-कभी साइन बोर्ड से चिह्नित, पर हमेशा नहीं।',
    'HOW TO RIDE': 'यात्रा कैसे करें',
    'Stop Request': 'स्टॉप का अनुरोध',
    "Pull the cord or push the strip when you hear your stop being announced. Otherwise, the driver will keep driving and can only drop you off at the next stop.":
      'जब आपके स्टॉप की घोषणा सुनें, तो रस्सी खींचें या पट्टी दबाएं। अन्यथा ड्राइवर चलता रहेगा और अगले स्टॉप पर ही उतार पाएगा।',
    'Some routes share stops on the other side of the road. It might be faster or easier to wait for the bus to come back around to the adjacent stop.':
      'कुछ रूट सड़क के दूसरी ओर स्टॉप साझा करते हैं। पास वाले स्टॉप पर बस के वापस आने का इंतज़ार करना तेज़ या आसान हो सकता है।',
    'Not Every Stop Is Automatic': 'हर स्टॉप पर बस अपने आप नहीं रुकती',
    'Plan Ahead': 'पहले से योजना बनाएं',
    "Leave earlier than you think you need to, especially during the beginning of the semester or peak riding times.":
      'जितना ज़रूरी लगे उससे पहले निकलें, खासकर सेमेस्टर की शुरुआत या व्यस्त समय में।',
    "Nobody knows exactly how timing will be affected by traffic, ridership, accidents, etc.":
      'यातायात, सवारियों की संख्या, दुर्घटनाओं आदि से समय पर सटीक असर का अंदाज़ा कोई नहीं लगा सकता।',
    'Full Bus / "Another Bus Follows"': 'भरी हुई बस / "एक और बस पीछे आ रही है"',
    'Rush Hours': 'व्यस्त समय',
    'Expect busses to be running late or full during rush hours: 7-8 AM, class changes, 3 PM, and 5 PM.':
      'व्यस्त समय (सुबह 7-8 बजे, क्लास बदलते समय, दोपहर 3 बजे और शाम 5 बजे) में बसों के देरी से या भरी होने की संभावना रखें।',
    'Mobility Devices & Bikes': 'गतिशीलता उपकरण और साइकिलें',
    'TIP': 'सुझाव',

    // ── Service Disruptions ─────────────────────────────────────────────
    'No active service disruptions.': 'फिलहाल कोई सेवा व्यवधान नहीं है।',
    'All Routes': 'सभी रूट',

    // ── Notifications ────────────────────────────────────────────────────
    'Enable Notifications': 'सूचनाएं सक्षम करें',
    'Required before any alerts (delays, detours, service news) can reach this device.':
      'इस डिवाइस पर कोई भी अलर्ट (देरी, मार्ग परिवर्तन, सेवा समाचार) पहुंचने से पहले यह आवश्यक है।',
    'Notifications are only available in English right now.':
      'सूचनाएं फिलहाल केवल अंग्रेज़ी में उपलब्ध हैं।',
    'My Routes': 'मेरे रूट',
    'Add a route to set up its alerts.': 'अलर्ट सेट करने के लिए एक रूट जोड़ें।',
    'No routes added yet. Pick one below.': 'अभी तक कोई रूट नहीं जोड़ा गया। नीचे से एक चुनें।',
    'Notify me if running': 'सूचित करें अगर देरी हो',
    'minutes late': 'मिनट से अधिक',
    'Notify me during these times if the route is running late:':
      'इन समयों के दौरान अगर रूट देरी से चल रहा हो तो मुझे सूचित करें:',
    'Always': 'हमेशा',
    'Specific times': 'निश्चित समय',
    'From': 'से',
    'To': 'तक',
    'Add another window': 'एक और समय-सीमा जोड़ें',
    'Notify me about reroutes': 'मार्ग परिवर्तन के बारे में सूचित करें',
    'Always sent right away, regardless of the schedule above.':
      'ऊपर दिए गए समय की परवाह किए बिना, यह हमेशा तुरंत भेजा जाता है।',
    'Add a route': 'रूट जोड़ें',

    // ── Calendar ─────────────────────────────────────────────────────────
    'Previous month': 'पिछला महीना',
    'Next month': 'अगला महीना',
    'No Service': 'सेवा नहीं',
    'Gameday': 'गेम डे',
    'Summer': 'गर्मी',
    'Break': 'अवकाश',
    'Regular': 'सामान्य',
    'Charter': 'चार्टर',
    'No scheduled transit changes today - normal posted hours apply.':
      'आज कोई निर्धारित परिवहन परिवर्तन नहीं है - सामान्य प्रकाशित समय लागू है।',
    'Close': 'बंद करें',

    // ── BTD Map ──────────────────────────────────────────────────────────
    'No routes selected': 'कोई रूट चयनित नहीं',
    'Running Today': 'आज सेवा में',
    'No Weekend Service': 'सप्ताहांत में कोई सेवा नहीं',

    // ── BTD Schedule ─────────────────────────────────────────────────────
    'Time points repeat every hour, on the same minutes, all day.':
      'समय बिंदु पूरे दिन हर घंटे उन्हीं मिनटों पर दोहराए जाते हैं।',
    'Excluding holidays. No weekend service.': 'छुट्टियों को छोड़कर। सप्ताहांत में कोई सेवा नहीं।',
    'ROUTES': 'रूट',

    // ── BTD Info (fares) ────────────────────────────────────────────────
    'Fixed routes serving Bryan & College Station.': 'Bryan और College Station की सेवा देने वाले निश्चित रूट।',
    'FIXED ROUTE (ONE-WAY)': 'निश्चित रूट (एक-तरफ़ा)',
    'TICKETS & PASSES': 'टिकट और पास',
    'REDUCED PASSES': 'रियायती पास',
    'WHERE TO BUY TICKETS & PASSES': 'टिकट और पास कहां खरीदें',
    'General Public': 'सामान्य जनता',
    'Children (6-12)': 'बच्चे (6-12)',
    'Children under 6 (with paying customer)': '6 वर्ष से कम उम्र के बच्चे (भुगतान करने वाले यात्री के साथ)',
    'FREE': 'मुफ़्त',
    'Senior / Disabled*': 'वरिष्ठ / दिव्यांग*',
    'Medicare*': 'Medicare*',
    'Blinn / TAMU Students*': 'Blinn / TAMU छात्र*',
    'Day Pass': 'दैनिक पास',
    'Unlimited trips in one day': 'एक दिन में असीमित यात्राएं',
    'Weekly Pass': 'साप्ताहिक पास',
    'Unlimited trips in 5 consecutive weekdays': '5 लगातार कार्यदिवसों में असीमित यात्राएं',
    'Monthly Pass': 'मासिक पास',
    'Unlimited trips in 31 consecutive days': '31 लगातार दिनों में असीमित यात्राएं',
    'Ticket Book': 'टिकट बुक',
    '40 one-way trips': '40 एक-तरफ़ा यात्राएं',
    'MultiRide Pass': 'MultiRide पास',
    '42 one-way trips': '42 एक-तरफ़ा यात्राएं',
    'S&D PunchPass*': 'S&D पंचपास*',
    'Purchase over the phone': 'फ़ोन पर खरीदें',
    'Stand away from the curb until the bus is completely stopped.':
      'जब तक बस पूरी तरह न रुक जाए, फुटपाथ के किनारे से दूर रहें।',
    'Have exact fare ready - drivers do not make change.':
      'सही किराया तैयार रखें - ड्राइवर खुले पैसे नहीं देते।',
    'Watch your step getting on and off the bus.': 'बस में चढ़ते-उतरते समय अपने कदम का ध्यान रखें।',
    'Use the handrails and sit in a seat as soon as possible.':
      'रेलिंग का उपयोग करें और जल्द से जल्द सीट पर बैठें।',
    "Don't let children play or stand on the seats.": 'बच्चों को सीटों पर खेलने या खड़े होने न दें।',
    'Be courteous to other passengers.': 'अन्य यात्रियों के साथ शिष्टाचार बरतें।',
    'No eating, drinking, smoking, or loud music.': 'खाना-पीना, धूम्रपान, या तेज़ संगीत मना है।',
    'No profanity, racial, or vulgar comments.': 'अभद्र, नस्लीय, या अश्लील टिप्पणियां मना हैं।',
    'Riding under the influence of alcohol or illegal drugs is prohibited.':
      'शराब या अवैध नशीले पदार्थों के प्रभाव में यात्रा करना प्रतिबंधित है।',
    'All buses are ADA wheelchair accessible (combined customer + mobility aid weight limit: 600 lbs).':
      'सभी बसें ADA व्हीलचेयर सुगम्य हैं (यात्री + गतिशीलता सहायक उपकरण का संयुक्त वज़न सीमा: 600 पाउंड)।',

    // ── Plan a Ride (both AggieSpirit + BTD) ────────────────────────────
    'Plan a Ride': 'यात्रा की योजना बनाएं',
    "This is an estimate from BTD's posted schedule. Buses run Monday-Friday, 5 AM-7 PM only.":
      'यह BTD की प्रकाशित समय सारणी पर आधारित अनुमान है। बसें केवल सोमवार-शुक्रवार, सुबह 5 बजे से शाम 7 बजे तक चलती हैं।',
    'Search a stop or address': 'स्टॉप या पता खोजें',
    'Clear search': 'खोज साफ़ करें',
    'Choose on Map': 'मानचित्र पर चुनें',
    'Swap': 'बदलें',
    'Leave after': 'इसके बाद निकलें',
    'Arrive by': 'इससे पहले पहुंचें',
    'Anytime': 'किसी भी समय',
    'No deadline': 'कोई समय-सीमा नहीं',
    'TIMING': 'समय',
    'Set a leave-after or arrive-by time (at least one is required).':
      'प्रस्थान या आगमन का समय सेट करें (कम से कम एक आवश्यक है)।',
    'Find Routes': 'रूट खोजें',
    'Set a leave-after or arrive-by time above to search.':
      'खोजने के लिए ऊपर प्रस्थान या आगमन का समय सेट करें।',
    'View Route': 'रूट देखें',
    'Confirm Location': 'स्थान की पुष्टि करें',
    'Cancel': 'रद्द करें',
    'Done': 'हो गया',
    'Choose a date': 'तारीख़ चुनें',

    // ── Route / stop picker sheets ───────────────────────────────────────
    'Select Routes': 'रूट चुनें',
    'Dismiss route picker': 'रूट चयनकर्ता बंद करें',

    // ── Common ────────────────────────────────────────────────────────────
    'Back': 'वापस',
    'Loading…': 'लोड हो रहा है…',
    'Search': 'खोजें',
  },

  vi: {
    // ── Tab bar ──────────────────────────────────────────────────────────
    'Map': 'Bản đồ',
    'Plan': 'Lên kế hoạch',
    'Calendar': 'Lịch',
    'More': 'Thêm',
    'Schedule': 'Lịch trình',

    // ── More / Settings (AggieSpirit) ───────────────────────────────────
    'Theme': 'Giao diện',
    'Light, dark, or follow system': 'Sáng, tối, hoặc theo hệ thống',
    'Accessibility': 'Trợ năng',
    'Icon/text size, contrast, and motion': 'Kích thước biểu tượng/văn bản, độ tương phản và chuyển động',
    'Favorite Routes': 'Tuyến yêu thích',
    'Pin routes to the top of the selector': 'Ghim tuyến lên đầu danh sách chọn',
    'Notifications': 'Thông báo',
    'Enable alerts for delays and reroutes': 'Bật cảnh báo trễ giờ và đổi tuyến',
    'Service Disruptions': 'Gián đoạn dịch vụ',
    'Construction reroutes and closures': 'Đổi tuyến và đóng đường do thi công',
    'Help Guide': 'Hướng dẫn sử dụng',
    'Stop types and tips for riding the bus': 'Các loại trạm dừng và mẹo đi xe buýt',
    'Unit Codes': 'Mã số xe',
    '(Experimental)': '(Thử nghiệm)',
    "Shows each unit's letter code (Alpha, Bravo, ...).": 'Hiển thị mã chữ cái của từng xe (Alpha, Bravo, ...).',
    'Brazos Transit District': 'Brazos Transit District',
    "Switch to BTD's bus service": 'Chuyển sang dịch vụ xe buýt của BTD',
    'Load into BTD': 'Mở thẳng vào BTD',
    'Open straight to BTD instead of the map when you start the app':
      'Mở thẳng vào BTD thay vì bản đồ khi khởi động ứng dụng',
    'Replay Tutorial': 'Xem lại hướng dẫn',
    'Watch the first-launch walkthrough again': 'Xem lại hướng dẫn lần đầu khởi động',

    // ── More (BTD) ───────────────────────────────────────────────────────
    'Fares, tickets, and contact info': 'Giá vé, vé xe và thông tin liên hệ',
    'AggieSpirit Buses': 'Xe buýt AggieSpirit',
    "Switch back to TAMU's bus service": 'Chuyển lại dịch vụ xe buýt của TAMU',
    "Switches back to TAMU's bus service": 'Chuyển lại dịch vụ xe buýt của TAMU',
    "Open straight to BTD instead of the map when you start the app.":
      'Mở thẳng vào BTD thay vì bản đồ khi khởi động ứng dụng.',
    "Opens the app directly to BTD's map on launch": 'Khi khởi động, mở thẳng vào bản đồ của BTD',
    'Info': 'Thông tin',

    // ── Theme screen ─────────────────────────────────────────────────────
    'System': 'Hệ thống',
    'Follow device settings': 'Theo cài đặt thiết bị',
    'Light': 'Sáng',
    'Always use light theme': 'Luôn dùng giao diện sáng',
    'Dark': 'Tối',
    'Always use dark theme': 'Luôn dùng giao diện tối',

    // ── Map provider screen ─────────────────────────────────────────────
    'Apple Maps': 'Apple Maps',
    'Default': 'Mặc định',
    'Google Maps': 'Google Maps',
    'Alternative': 'Thay thế',

    // ── Accessibility screen ────────────────────────────────────────────
    'Icon Size': 'Kích thước biểu tượng',
    'Scales map markers and tab bar icons. Changing this will close any routes you have open on the map.':
      'Thay đổi kích thước điểm đánh dấu bản đồ và biểu tượng thanh tab. Thay đổi này sẽ đóng mọi tuyến đang mở trên bản đồ.',
    'Text Size': 'Kích thước văn bản',
    'Scales text in the More menu and key screens.': 'Thay đổi kích thước văn bản trong menu Thêm và các màn hình chính.',
    'High Contrast': 'Độ tương phản cao',
    'Stronger contrast between text, backgrounds, and borders.': 'Tăng độ tương phản giữa văn bản, nền và viền.',
    'Reduce Motion': 'Giảm chuyển động',
    'Shortens or removes animations like the tour and panel slides.':
      'Rút ngắn hoặc loại bỏ hiệu ứng chuyển động như hướng dẫn và trượt bảng.',
    'Extra Small': 'Rất nhỏ',
    'Small': 'Nhỏ',
    'Large': 'Lớn',
    'Extra Large': 'Rất lớn',
    'Min': 'Nhỏ nhất',
    'Max': 'Lớn nhất',

    // ── Language screen (new) ───────────────────────────────────────────
    'Language': 'Ngôn ngữ',
    'Choose your language': 'Chọn ngôn ngữ của bạn',
    'Machine-translated. Wording may be imperfect or occasionally inaccurate - route names, live bus data, and service alerts always show in English.':
      'Được dịch bằng máy. Cách diễn đạt có thể chưa hoàn hảo hoặc đôi khi không chính xác - tên tuyến, dữ liệu xe buýt trực tiếp và cảnh báo dịch vụ luôn hiển thị bằng tiếng Anh.',

    // ── Favorites screen ─────────────────────────────────────────────────
    'Favorited routes appear at the top of the route selector on the map.':
      'Các tuyến yêu thích sẽ hiện ở đầu danh sách chọn tuyến trên bản đồ.',

    // ── Help Guide ───────────────────────────────────────────────────────
    'STOP TYPES': 'LOẠI TRẠM DỪNG',
    'Normal Stop': 'Trạm dừng thường',
    "Just a regular stop on the route. The driver will stop if a passenger requests the stop or if someone's waiting to board.":
      'Một trạm dừng thông thường trên tuyến. Tài xế sẽ dừng nếu hành khách yêu cầu hoặc có người đang chờ lên xe.',
    'Timepoint': 'Điểm kiểm soát giờ',
    "Similar to a regular stop, but if the driver is running early, they'll hold here until the scheduled leave time.":
      'Tương tự trạm dừng thường, nhưng nếu tài xế đến sớm, họ sẽ chờ ở đây đến giờ khởi hành theo lịch.',
    'Temporary Stop': 'Trạm dừng tạm thời',
    'Like a normal stop, but not permanent. Usually for construction or temporary route changes. Sometimes marked with an A-frame sign, but not always.':
      'Giống trạm dừng thường nhưng không cố định. Thường do thi công hoặc thay đổi tuyến tạm thời. Đôi khi có biển báo, nhưng không phải lúc nào cũng có.',
    'HOW TO RIDE': 'CÁCH ĐI XE',
    'Stop Request': 'Yêu cầu dừng xe',
    "Pull the cord or push the strip when you hear your stop being announced. Otherwise, the driver will keep driving and can only drop you off at the next stop.":
      'Kéo dây hoặc nhấn nút khi nghe thông báo đến trạm của bạn. Nếu không, tài xế sẽ tiếp tục chạy và chỉ có thể cho bạn xuống ở trạm tiếp theo.',
    'Some routes share stops on the other side of the road. It might be faster or easier to wait for the bus to come back around to the adjacent stop.':
      'Một số tuyến dùng chung trạm ở phía bên kia đường. Đôi khi chờ xe quay lại trạm gần đó sẽ nhanh hoặc dễ hơn.',
    'Not Every Stop Is Automatic': 'Không phải trạm nào cũng tự động dừng',
    'Plan Ahead': 'Lên kế hoạch trước',
    "Leave earlier than you think you need to, especially during the beginning of the semester or peak riding times.":
      'Xuất phát sớm hơn dự định, đặc biệt vào đầu học kỳ hoặc giờ cao điểm.',
    "Nobody knows exactly how timing will be affected by traffic, ridership, accidents, etc.":
      'Không ai biết chính xác giao thông, lượng khách, tai nạn, v.v. sẽ ảnh hưởng đến thời gian ra sao.',
    'Full Bus / "Another Bus Follows"': 'Xe đầy khách / "Xe tiếp theo đang đến"',
    'Rush Hours': 'Giờ cao điểm',
    'Expect busses to be running late or full during rush hours: 7-8 AM, class changes, 3 PM, and 5 PM.':
      'Xe buýt có thể trễ giờ hoặc đầy khách vào giờ cao điểm: 7-8 giờ sáng, giờ đổi tiết học, 3 giờ chiều và 5 giờ chiều.',
    'Mobility Devices & Bikes': 'Thiết bị hỗ trợ di chuyển và xe đạp',
    'TIP': 'MẸO',

    // ── Service Disruptions ─────────────────────────────────────────────
    'No active service disruptions.': 'Hiện không có gián đoạn dịch vụ.',
    'All Routes': 'Tất cả tuyến',

    // ── Notifications ────────────────────────────────────────────────────
    'Enable Notifications': 'Bật thông báo',
    'Required before any alerts (delays, detours, service news) can reach this device.':
      'Cần bật để thiết bị này nhận được bất kỳ cảnh báo nào (trễ giờ, đổi tuyến, tin tức dịch vụ).',
    'Notifications are only available in English right now.':
      'Hiện tại thông báo chỉ có bằng tiếng Anh.',
    'My Routes': 'Tuyến của tôi',
    'Add a route to set up its alerts.': 'Thêm một tuyến để thiết lập cảnh báo.',
    'No routes added yet. Pick one below.': 'Chưa có tuyến nào được thêm. Chọn một tuyến bên dưới.',
    'Notify me if running': 'Báo cho tôi nếu trễ',
    'minutes late': 'phút',
    'Notify me during these times if the route is running late:':
      'Báo cho tôi trong các khoảng thời gian này nếu tuyến bị trễ:',
    'Always': 'Luôn luôn',
    'Specific times': 'Khung giờ cụ thể',
    'From': 'Từ',
    'To': 'Đến',
    'Add another window': 'Thêm khung giờ khác',
    'Notify me about reroutes': 'Báo cho tôi khi đổi tuyến',
    'Always sent right away, regardless of the schedule above.':
      'Luôn được gửi ngay lập tức, bất kể lịch trình ở trên.',
    'Add a route': 'Thêm tuyến',

    // ── Calendar ─────────────────────────────────────────────────────────
    'Previous month': 'Tháng trước',
    'Next month': 'Tháng sau',
    'No Service': 'Không hoạt động',
    'Gameday': 'Ngày thi đấu',
    'Summer': 'Mùa hè',
    'Break': 'Nghỉ lễ',
    'Regular': 'Bình thường',
    'Charter': 'Xe hợp đồng',
    'No scheduled transit changes today - normal posted hours apply.':
      'Hôm nay không có thay đổi lịch trình - áp dụng giờ hoạt động bình thường.',
    'Close': 'Đóng',

    // ── BTD Map ──────────────────────────────────────────────────────────
    'No routes selected': 'Chưa chọn tuyến nào',
    'Running Today': 'Hoạt động hôm nay',
    'No Weekend Service': 'Không hoạt động cuối tuần',

    // ── BTD Schedule ─────────────────────────────────────────────────────
    'Time points repeat every hour, on the same minutes, all day.':
      'Các điểm kiểm soát giờ lặp lại mỗi giờ, cùng phút, suốt cả ngày.',
    'Excluding holidays. No weekend service.': 'Không áp dụng vào ngày lễ. Không hoạt động cuối tuần.',
    'ROUTES': 'TUYẾN',

    // ── BTD Info (fares) ────────────────────────────────────────────────
    'Fixed routes serving Bryan & College Station.': 'Các tuyến cố định phục vụ Bryan & College Station.',
    'FIXED ROUTE (ONE-WAY)': 'TUYẾN CỐ ĐỊNH (MỘT CHIỀU)',
    'TICKETS & PASSES': 'VÉ VÀ THẺ',
    'REDUCED PASSES': 'THẺ GIẢM GIÁ',
    'WHERE TO BUY TICKETS & PASSES': 'MUA VÉ VÀ THẺ Ở ĐÂU',
    'General Public': 'Công chúng',
    'Children (6-12)': 'Trẻ em (6-12 tuổi)',
    'Children under 6 (with paying customer)': 'Trẻ dưới 6 tuổi (đi cùng người trả tiền)',
    'FREE': 'MIỄN PHÍ',
    'Senior / Disabled*': 'Người cao tuổi / Khuyết tật*',
    'Medicare*': 'Medicare*',
    'Blinn / TAMU Students*': 'Sinh viên Blinn / TAMU*',
    'Day Pass': 'Vé ngày',
    'Unlimited trips in one day': 'Không giới hạn chuyến trong một ngày',
    'Weekly Pass': 'Vé tuần',
    'Unlimited trips in 5 consecutive weekdays': 'Không giới hạn chuyến trong 5 ngày làm việc liên tiếp',
    'Monthly Pass': 'Vé tháng',
    'Unlimited trips in 31 consecutive days': 'Không giới hạn chuyến trong 31 ngày liên tiếp',
    'Ticket Book': 'Tập vé',
    '40 one-way trips': '40 chuyến một chiều',
    'MultiRide Pass': 'Vé MultiRide',
    '42 one-way trips': '42 chuyến một chiều',
    'S&D PunchPass*': 'Vé bấm lỗ S&D*',
    'Purchase over the phone': 'Mua qua điện thoại',
    'Stand away from the curb until the bus is completely stopped.':
      'Đứng cách xa lề đường cho đến khi xe buýt dừng hẳn.',
    'Have exact fare ready - drivers do not make change.':
      'Chuẩn bị sẵn tiền vé đúng số - tài xế không thối tiền.',
    'Watch your step getting on and off the bus.': 'Cẩn thận khi lên và xuống xe.',
    'Use the handrails and sit in a seat as soon as possible.':
      'Bám tay vịn và ngồi vào ghế càng sớm càng tốt.',
    "Don't let children play or stand on the seats.": 'Không để trẻ em chơi hoặc đứng trên ghế.',
    'Be courteous to other passengers.': 'Hãy lịch sự với hành khách khác.',
    'No eating, drinking, smoking, or loud music.': 'Không ăn uống, hút thuốc, hoặc mở nhạc lớn.',
    'No profanity, racial, or vulgar comments.': 'Không nói tục, phân biệt chủng tộc, hoặc lời lẽ thô tục.',
    'Riding under the influence of alcohol or illegal drugs is prohibited.':
      'Cấm đi xe khi đang say rượu hoặc dùng chất cấm.',
    'All buses are ADA wheelchair accessible (combined customer + mobility aid weight limit: 600 lbs).':
      'Tất cả xe buýt đều hỗ trợ xe lăn theo chuẩn ADA (giới hạn trọng lượng kết hợp hành khách + thiết bị hỗ trợ: 600 lbs).',

    // ── Plan a Ride (both AggieSpirit + BTD) ────────────────────────────
    'Plan a Ride': 'Lên kế hoạch chuyến đi',
    "This is an estimate from BTD's posted schedule. Buses run Monday-Friday, 5 AM-7 PM only.":
      'Đây là ước tính dựa trên lịch trình công bố của BTD. Xe buýt chỉ chạy từ thứ Hai đến thứ Sáu, 5 giờ sáng đến 7 giờ tối.',
    'Search a stop or address': 'Tìm trạm dừng hoặc địa chỉ',
    'Clear search': 'Xóa tìm kiếm',
    'Choose on Map': 'Chọn trên bản đồ',
    'Swap': 'Hoán đổi',
    'Leave after': 'Khởi hành sau',
    'Arrive by': 'Đến trước',
    'Anytime': 'Bất kỳ lúc nào',
    'No deadline': 'Không giới hạn',
    'TIMING': 'THỜI GIAN',
    'Set a leave-after or arrive-by time (at least one is required).':
      'Đặt giờ khởi hành hoặc giờ đến (cần ít nhất một giờ).',
    'Find Routes': 'Tìm tuyến',
    'Set a leave-after or arrive-by time above to search.':
      'Đặt giờ khởi hành hoặc giờ đến ở trên để tìm kiếm.',
    'View Route': 'Xem tuyến',
    'Confirm Location': 'Xác nhận vị trí',
    'Cancel': 'Hủy',
    'Done': 'Xong',
    'Choose a date': 'Chọn ngày',

    // ── Route / stop picker sheets ───────────────────────────────────────
    'Select Routes': 'Chọn tuyến',
    'Dismiss route picker': 'Đóng bộ chọn tuyến',

    // ── Common ────────────────────────────────────────────────────────────
    'Back': 'Quay lại',
    'Loading…': 'Đang tải…',
    'Search': 'Tìm kiếm',
  },

  ko: {
    // ── Tab bar ──────────────────────────────────────────────────────────
    'Map': '지도',
    'Plan': '경로 계획',
    'Calendar': '캘린더',
    'More': '더보기',
    'Schedule': '시간표',

    // ── More / Settings (AggieSpirit) ───────────────────────────────────
    'Theme': '테마',
    'Light, dark, or follow system': '밝게, 어둡게, 또는 시스템 설정 따르기',
    'Accessibility': '접근성',
    'Icon/text size, contrast, and motion': '아이콘/텍스트 크기, 명암 대비, 애니메이션',
    'Favorite Routes': '즐겨찾는 노선',
    'Pin routes to the top of the selector': '노선을 선택 목록 맨 위에 고정',
    'Notifications': '알림',
    'Enable alerts for delays and reroutes': '지연 및 우회 알림 활성화',
    'Service Disruptions': '운행 차질',
    'Construction reroutes and closures': '공사로 인한 우회 및 폐쇄',
    'Help Guide': '이용 안내',
    'Stop types and tips for riding the bus': '정류장 종류 및 버스 이용 팁',
    'Unit Codes': '차량 코드',
    '(Experimental)': '(실험적 기능)',
    "Shows each unit's letter code (Alpha, Bravo, ...).": '각 차량의 알파벳 코드(Alpha, Bravo 등)를 표시합니다.',
    'Brazos Transit District': 'Brazos Transit District',
    "Switch to BTD's bus service": 'BTD 버스 서비스로 전환',
    'Load into BTD': 'BTD로 바로 시작',
    'Open straight to BTD instead of the map when you start the app':
      '앱 시작 시 지도 대신 BTD로 바로 열기',
    'Replay Tutorial': '튜토리얼 다시 보기',
    'Watch the first-launch walkthrough again': '최초 실행 안내를 다시 보기',

    // ── More (BTD) ───────────────────────────────────────────────────────
    'Fares, tickets, and contact info': '요금, 티켓 및 연락처 정보',
    'AggieSpirit Buses': 'AggieSpirit 버스',
    "Switch back to TAMU's bus service": 'TAMU 버스 서비스로 다시 전환',
    "Switches back to TAMU's bus service": 'TAMU 버스 서비스로 다시 전환합니다',
    "Open straight to BTD instead of the map when you start the app.":
      '앱 시작 시 지도 대신 BTD로 바로 열기.',
    "Opens the app directly to BTD's map on launch": '실행 시 BTD 지도로 바로 열립니다',
    'Info': '정보',

    // ── Theme screen ─────────────────────────────────────────────────────
    'System': '시스템',
    'Follow device settings': '기기 설정 따르기',
    'Light': '밝게',
    'Always use light theme': '항상 밝은 테마 사용',
    'Dark': '어둡게',
    'Always use dark theme': '항상 어두운 테마 사용',

    // ── Map provider screen ─────────────────────────────────────────────
    'Apple Maps': 'Apple 지도',
    'Default': '기본값',
    'Google Maps': 'Google 지도',
    'Alternative': '대체',

    // ── Accessibility screen ────────────────────────────────────────────
    'Icon Size': '아이콘 크기',
    'Scales map markers and tab bar icons. Changing this will close any routes you have open on the map.':
      '지도 마커와 탭 바 아이콘의 크기를 조정합니다. 변경하면 지도에 열려 있는 노선이 모두 닫힙니다.',
    'Text Size': '텍스트 크기',
    'Scales text in the More menu and key screens.': '더보기 메뉴 및 주요 화면의 텍스트 크기를 조정합니다.',
    'High Contrast': '고대비',
    'Stronger contrast between text, backgrounds, and borders.': '텍스트, 배경, 테두리 간 대비를 강화합니다.',
    'Reduce Motion': '동작 줄이기',
    'Shortens or removes animations like the tour and panel slides.':
      '투어 및 패널 슬라이드 같은 애니메이션을 줄이거나 제거합니다.',
    'Extra Small': '매우 작게',
    'Small': '작게',
    'Large': '크게',
    'Extra Large': '매우 크게',
    'Min': '최소',
    'Max': '최대',

    // ── Language screen (new) ───────────────────────────────────────────
    'Language': '언어',
    'Choose your language': '언어를 선택하세요',
    'Machine-translated. Wording may be imperfect or occasionally inaccurate - route names, live bus data, and service alerts always show in English.':
      '기계 번역입니다. 표현이 매끄럽지 않거나 가끔 부정확할 수 있습니다 - 노선 이름, 실시간 버스 데이터, 서비스 알림은 항상 영어로 표시됩니다.',

    // ── Favorites screen ─────────────────────────────────────────────────
    'Favorited routes appear at the top of the route selector on the map.':
      '즐겨찾는 노선은 지도의 노선 선택 목록 맨 위에 표시됩니다.',

    // ── Help Guide ───────────────────────────────────────────────────────
    'STOP TYPES': '정류장 종류',
    'Normal Stop': '일반 정류장',
    "Just a regular stop on the route. The driver will stop if a passenger requests the stop or if someone's waiting to board.":
      '노선 상의 일반 정류장입니다. 승객이 하차를 요청하거나 탑승을 기다리는 사람이 있으면 기사가 정차합니다.',
    'Timepoint': '시간 기준점',
    "Similar to a regular stop, but if the driver is running early, they'll hold here until the scheduled leave time.":
      '일반 정류장과 비슷하지만, 기사가 예정보다 일찍 도착하면 예정된 출발 시간까지 이곳에서 대기합니다.',
    'Temporary Stop': '임시 정류장',
    'Like a normal stop, but not permanent. Usually for construction or temporary route changes. Sometimes marked with an A-frame sign, but not always.':
      '일반 정류장과 비슷하지만 영구적이지 않습니다. 보통 공사나 임시 노선 변경 때문이며, 표지판으로 표시되기도 하지만 항상 그런 것은 아닙니다.',
    'HOW TO RIDE': '이용 방법',
    'Stop Request': '하차 요청',
    "Pull the cord or push the strip when you hear your stop being announced. Otherwise, the driver will keep driving and can only drop you off at the next stop.":
      '정류장 안내 방송이 나오면 줄을 당기거나 벨을 누르세요. 그렇지 않으면 기사는 계속 운행하며 다음 정류장에서만 하차시켜 줄 수 있습니다.',
    'Some routes share stops on the other side of the road. It might be faster or easier to wait for the bus to come back around to the adjacent stop.':
      '일부 노선은 도로 반대편 정류장을 공유합니다. 버스가 인근 정류장으로 돌아올 때까지 기다리는 것이 더 빠르거나 편할 수 있습니다.',
    'Not Every Stop Is Automatic': '모든 정류장에서 자동으로 정차하지는 않습니다',
    'Plan Ahead': '미리 계획하기',
    "Leave earlier than you think you need to, especially during the beginning of the semester or peak riding times.":
      '특히 학기 초나 혼잡 시간대에는 예상보다 일찍 출발하세요.',
    "Nobody knows exactly how timing will be affected by traffic, ridership, accidents, etc.":
      '교통 상황, 이용객 수, 사고 등으로 인한 시간 변동은 정확히 예측할 수 없습니다.',
    'Full Bus / "Another Bus Follows"': '만차 / "다음 버스가 이어서 옵니다"',
    'Rush Hours': '혼잡 시간대',
    'Expect busses to be running late or full during rush hours: 7-8 AM, class changes, 3 PM, and 5 PM.':
      '혼잡 시간대(오전 7-8시, 수업 이동 시간, 오후 3시, 오후 5시)에는 버스가 지연되거나 만차일 수 있습니다.',
    'Mobility Devices & Bikes': '이동 보조기구 및 자전거',
    'TIP': '팁',

    // ── Service Disruptions ─────────────────────────────────────────────
    'No active service disruptions.': '현재 운행 차질이 없습니다.',
    'All Routes': '전체 노선',

    // ── Notifications ────────────────────────────────────────────────────
    'Enable Notifications': '알림 활성화',
    'Required before any alerts (delays, detours, service news) can reach this device.':
      '이 기기로 알림(지연, 우회, 서비스 소식)을 받으려면 먼저 활성화해야 합니다.',
    'Notifications are only available in English right now.':
      '알림은 현재 영어로만 제공됩니다.',
    'My Routes': '내 노선',
    'Add a route to set up its alerts.': '알림을 설정할 노선을 추가하세요.',
    'No routes added yet. Pick one below.': '아직 추가된 노선이 없습니다. 아래에서 선택하세요.',
    'Notify me if running': '지연 시 알림 기준',
    'minutes late': '분 이상',
    'Notify me during these times if the route is running late:':
      '다음 시간대에 노선이 지연되면 알려주세요:',
    'Always': '항상',
    'Specific times': '특정 시간대',
    'From': '시작',
    'To': '종료',
    'Add another window': '시간대 추가',
    'Notify me about reroutes': '우회 시 알림',
    'Always sent right away, regardless of the schedule above.':
      '위 일정과 관계없이 항상 즉시 전송됩니다.',
    'Add a route': '노선 추가',

    // ── Calendar ─────────────────────────────────────────────────────────
    'Previous month': '이전 달',
    'Next month': '다음 달',
    'No Service': '운행 없음',
    'Gameday': '경기일',
    'Summer': '여름 방학',
    'Break': '방학',
    'Regular': '일반',
    'Charter': '전세',
    'No scheduled transit changes today - normal posted hours apply.':
      '오늘은 예정된 운행 변경이 없습니다 - 정상 공지 시간이 적용됩니다.',
    'Close': '닫기',

    // ── BTD Map ──────────────────────────────────────────────────────────
    'No routes selected': '선택된 노선 없음',
    'Running Today': '오늘 운행',
    'No Weekend Service': '주말 운행 없음',

    // ── BTD Schedule ─────────────────────────────────────────────────────
    'Time points repeat every hour, on the same minutes, all day.':
      '시간 기준점은 하루 종일 매시간 같은 분에 반복됩니다.',
    'Excluding holidays. No weekend service.': '공휴일은 제외됩니다. 주말에는 운행하지 않습니다.',
    'ROUTES': '노선',

    // ── BTD Info (fares) ────────────────────────────────────────────────
    'Fixed routes serving Bryan & College Station.': 'Bryan 및 College Station을 운행하는 고정 노선입니다.',
    'FIXED ROUTE (ONE-WAY)': '고정 노선 (편도)',
    'TICKETS & PASSES': '티켓 및 패스',
    'REDUCED PASSES': '할인 패스',
    'WHERE TO BUY TICKETS & PASSES': '티켓 및 패스 구매처',
    'General Public': '일반',
    'Children (6-12)': '어린이 (6-12세)',
    'Children under 6 (with paying customer)': '6세 미만 어린이 (유료 승객 동반 시)',
    'FREE': '무료',
    'Senior / Disabled*': '노인 / 장애인*',
    'Medicare*': 'Medicare*',
    'Blinn / TAMU Students*': 'Blinn / TAMU 학생*',
    'Day Pass': '1일권',
    'Unlimited trips in one day': '하루 무제한 이용',
    'Weekly Pass': '주간권',
    'Unlimited trips in 5 consecutive weekdays': '연속 평일 5일 무제한 이용',
    'Monthly Pass': '월간권',
    'Unlimited trips in 31 consecutive days': '연속 31일 무제한 이용',
    'Ticket Book': '티켓북',
    '40 one-way trips': '편도 40회',
    'MultiRide Pass': 'MultiRide 패스',
    '42 one-way trips': '편도 42회',
    'S&D PunchPass*': 'S&D 펀치패스*',
    'Purchase over the phone': '전화로 구매',
    'Stand away from the curb until the bus is completely stopped.':
      '버스가 완전히 정차할 때까지 연석에서 떨어져 서 있으세요.',
    'Have exact fare ready - drivers do not make change.':
      '정확한 요금을 준비하세요 - 기사는 거스름돈을 주지 않습니다.',
    'Watch your step getting on and off the bus.': '승하차 시 발밑을 조심하세요.',
    'Use the handrails and sit in a seat as soon as possible.':
      '손잡이를 잡고 가능한 한 빨리 자리에 앉으세요.',
    "Don't let children play or stand on the seats.": '어린이가 좌석에서 놀거나 서 있지 않도록 해 주세요.',
    'Be courteous to other passengers.': '다른 승객에게 예의를 지켜 주세요.',
    'No eating, drinking, smoking, or loud music.': '음식 섭취, 흡연, 큰 소리로 음악 재생은 금지됩니다.',
    'No profanity, racial, or vulgar comments.': '욕설, 인종차별적 발언, 저속한 발언은 금지됩니다.',
    'Riding under the influence of alcohol or illegal drugs is prohibited.':
      '음주 또는 불법 약물 영향 하에서의 탑승은 금지됩니다.',
    'All buses are ADA wheelchair accessible (combined customer + mobility aid weight limit: 600 lbs).':
      '모든 버스는 ADA 휠체어 이용이 가능합니다 (승객 + 이동 보조기구 합산 무게 제한: 600파운드).',

    // ── Plan a Ride (both AggieSpirit + BTD) ────────────────────────────
    'Plan a Ride': '경로 계획하기',
    "This is an estimate from BTD's posted schedule. Buses run Monday-Friday, 5 AM-7 PM only.":
      '이는 BTD의 공지된 시간표를 기반으로 한 예상치입니다. 버스는 월-금요일 오전 5시부터 오후 7시까지만 운행합니다.',
    'Search a stop or address': '정류장 또는 주소 검색',
    'Clear search': '검색 지우기',
    'Choose on Map': '지도에서 선택',
    'Swap': '교체',
    'Leave after': '출발 시각(이후)',
    'Arrive by': '도착 시각(이전)',
    'Anytime': '언제든지',
    'No deadline': '기한 없음',
    'TIMING': '시간 설정',
    'Set a leave-after or arrive-by time (at least one is required).':
      '출발 또는 도착 시간을 설정하세요 (최소 하나 필요).',
    'Find Routes': '경로 찾기',
    'Set a leave-after or arrive-by time above to search.':
      '검색하려면 위에서 출발 또는 도착 시간을 설정하세요.',
    'View Route': '경로 보기',
    'Confirm Location': '위치 확인',
    'Cancel': '취소',
    'Done': '완료',
    'Choose a date': '날짜 선택',

    // ── Route / stop picker sheets ───────────────────────────────────────
    'Select Routes': '노선 선택',
    'Dismiss route picker': '노선 선택 닫기',

    // ── Common ────────────────────────────────────────────────────────────
    'Back': '뒤로',
    'Loading…': '로딩 중…',
    'Search': '검색',
  },

  // NOTE: Arabic is a right-to-left language, but the app's layout itself
  // (icon positions, row direction, etc.) is not RTL-mirrored - only the
  // text is translated. That's a real limitation, not something a rider
  // should have to guess at.
  ar: {
    // ── Tab bar ──────────────────────────────────────────────────────────
    'Map': 'الخريطة',
    'Plan': 'التخطيط',
    'Calendar': 'التقويم',
    'More': 'المزيد',
    'Schedule': 'الجدول الزمني',

    // ── More / Settings (AggieSpirit) ───────────────────────────────────
    'Theme': 'المظهر',
    'Light, dark, or follow system': 'فاتح، داكن، أو حسب النظام',
    'Accessibility': 'إمكانية الوصول',
    'Icon/text size, contrast, and motion': 'حجم الأيقونات/النص، التباين، والحركة',
    'Favorite Routes': 'الخطوط المفضلة',
    'Pin routes to the top of the selector': 'تثبيت الخطوط أعلى قائمة الاختيار',
    'Notifications': 'الإشعارات',
    'Enable alerts for delays and reroutes': 'تفعيل تنبيهات التأخير وتغيير المسار',
    'Service Disruptions': 'انقطاعات الخدمة',
    'Construction reroutes and closures': 'تحويلات وإغلاقات بسبب الإنشاءات',
    'Help Guide': 'دليل المساعدة',
    'Stop types and tips for riding the bus': 'أنواع المحطات ونصائح ركوب الحافلة',
    'Unit Codes': 'رموز المركبات',
    '(Experimental)': '(تجريبي)',
    "Shows each unit's letter code (Alpha, Bravo, ...).": 'يعرض الرمز الحرفي لكل مركبة (Alpha، Bravo، ...).',
    'Brazos Transit District': 'Brazos Transit District',
    "Switch to BTD's bus service": 'التبديل إلى خدمة حافلات BTD',
    'Load into BTD': 'الفتح مباشرة على BTD',
    'Open straight to BTD instead of the map when you start the app':
      'الفتح مباشرة على BTD بدلاً من الخريطة عند بدء التطبيق',
    'Replay Tutorial': 'إعادة مشاهدة الشرح التوضيحي',
    'Watch the first-launch walkthrough again': 'مشاهدة شرح التشغيل الأول مرة أخرى',

    // ── More (BTD) ───────────────────────────────────────────────────────
    'Fares, tickets, and contact info': 'الأجرة والتذاكر ومعلومات الاتصال',
    'AggieSpirit Buses': 'حافلات AggieSpirit',
    "Switch back to TAMU's bus service": 'العودة إلى خدمة حافلات TAMU',
    "Switches back to TAMU's bus service": 'يعود إلى خدمة حافلات TAMU',
    "Open straight to BTD instead of the map when you start the app.":
      'الفتح مباشرة على BTD بدلاً من الخريطة عند بدء التطبيق.',
    "Opens the app directly to BTD's map on launch": 'يفتح التطبيق مباشرة على خريطة BTD عند التشغيل',
    'Info': 'معلومات',

    // ── Theme screen ─────────────────────────────────────────────────────
    'System': 'النظام',
    'Follow device settings': 'حسب إعدادات الجهاز',
    'Light': 'فاتح',
    'Always use light theme': 'استخدام المظهر الفاتح دائمًا',
    'Dark': 'داكن',
    'Always use dark theme': 'استخدام المظهر الداكن دائمًا',

    // ── Map provider screen ─────────────────────────────────────────────
    'Apple Maps': 'خرائط Apple',
    'Default': 'افتراضي',
    'Google Maps': 'خرائط Google',
    'Alternative': 'بديل',

    // ── Accessibility screen ────────────────────────────────────────────
    'Icon Size': 'حجم الأيقونات',
    'Scales map markers and tab bar icons. Changing this will close any routes you have open on the map.':
      'يغيّر حجم علامات الخريطة وأيقونات شريط التبويب. تغيير هذا الإعداد سيغلق أي خطوط مفتوحة على الخريطة.',
    'Text Size': 'حجم النص',
    'Scales text in the More menu and key screens.': 'يغيّر حجم النص في قائمة "المزيد" والشاشات الرئيسية.',
    'High Contrast': 'تباين عالٍ',
    'Stronger contrast between text, backgrounds, and borders.': 'تباين أقوى بين النص والخلفيات والحدود.',
    'Reduce Motion': 'تقليل الحركة',
    'Shortens or removes animations like the tour and panel slides.':
      'يقصّر أو يزيل الرسوم المتحركة مثل الجولة التعريفية وانزلاق اللوحات.',
    'Extra Small': 'صغير جدًا',
    'Small': 'صغير',
    'Large': 'كبير',
    'Extra Large': 'كبير جدًا',
    'Min': 'الحد الأدنى',
    'Max': 'الحد الأقصى',

    // ── Language screen (new) ───────────────────────────────────────────
    'Language': 'اللغة',
    'Choose your language': 'اختر لغتك',
    'Machine-translated. Wording may be imperfect or occasionally inaccurate - route names, live bus data, and service alerts always show in English.':
      'هذه ترجمة آلية. قد تكون الصياغة غير دقيقة أحيانًا - أسماء الخطوط وبيانات الحافلات المباشرة وتنبيهات الخدمة تظهر دائمًا بالإنجليزية.',

    // ── Favorites screen ─────────────────────────────────────────────────
    'Favorited routes appear at the top of the route selector on the map.':
      'تظهر الخطوط المفضلة أعلى قائمة اختيار الخطوط على الخريطة.',

    // ── Help Guide ───────────────────────────────────────────────────────
    'STOP TYPES': 'أنواع المحطات',
    'Normal Stop': 'محطة عادية',
    "Just a regular stop on the route. The driver will stop if a passenger requests the stop or if someone's waiting to board.":
      'محطة عادية على الخط. سيتوقف السائق إذا طلب أحد الركاب التوقف أو كان هناك من ينتظر الصعود.',
    'Timepoint': 'نقطة توقيت',
    "Similar to a regular stop, but if the driver is running early, they'll hold here until the scheduled leave time.":
      'مشابهة للمحطة العادية، لكن إذا وصل السائق مبكرًا فسينتظر هنا حتى موعد المغادرة المحدد.',
    'Temporary Stop': 'محطة مؤقتة',
    'Like a normal stop, but not permanent. Usually for construction or temporary route changes. Sometimes marked with an A-frame sign, but not always.':
      'مثل المحطة العادية لكنها غير دائمة. عادةً بسبب الإنشاءات أو تغييرات مؤقتة في المسار، وقد تُشار بلافتة أحيانًا وليس دائمًا.',
    'HOW TO RIDE': 'كيفية الركوب',
    'Stop Request': 'طلب التوقف',
    "Pull the cord or push the strip when you hear your stop being announced. Otherwise, the driver will keep driving and can only drop you off at the next stop.":
      'اسحب الحبل أو اضغط الشريط عند سماع الإعلان عن محطتك. وإلا سيواصل السائق القيادة ولن يتمكن من إنزالك إلا في المحطة التالية.',
    'Some routes share stops on the other side of the road. It might be faster or easier to wait for the bus to come back around to the adjacent stop.':
      'بعض الخطوط تشترك في محطات على الجانب الآخر من الطريق. قد يكون انتظار عودة الحافلة إلى المحطة المجاورة أسرع أو أسهل.',
    'Not Every Stop Is Automatic': 'ليست كل المحطات تلقائية',
    'Plan Ahead': 'خطط مسبقًا',
    "Leave earlier than you think you need to, especially during the beginning of the semester or peak riding times.":
      'غادر أبكر مما تعتقد أنك بحاجة إليه، خاصة في بداية الفصل الدراسي أو أوقات الذروة.',
    "Nobody knows exactly how timing will be affected by traffic, ridership, accidents, etc.":
      'لا أحد يعرف بالضبط كيف سيتأثر التوقيت بالازدحام أو عدد الركاب أو الحوادث وغيرها.',
    'Full Bus / "Another Bus Follows"': 'حافلة ممتلئة / "حافلة أخرى قادمة"',
    'Rush Hours': 'ساعات الذروة',
    'Expect busses to be running late or full during rush hours: 7-8 AM, class changes, 3 PM, and 5 PM.':
      'توقع تأخر الحافلات أو امتلاءها في ساعات الذروة: 7-8 صباحًا، وأوقات تبديل الحصص، و3 مساءً، و5 مساءً.',
    'Mobility Devices & Bikes': 'أجهزة التنقل والدراجات',
    'TIP': 'نصيحة',

    // ── Service Disruptions ─────────────────────────────────────────────
    'No active service disruptions.': 'لا توجد انقطاعات خدمة حاليًا.',
    'All Routes': 'جميع الخطوط',

    // ── Notifications ────────────────────────────────────────────────────
    'Enable Notifications': 'تفعيل الإشعارات',
    'Required before any alerts (delays, detours, service news) can reach this device.':
      'مطلوب قبل أن تصل أي تنبيهات (تأخيرات، تحويلات، أخبار الخدمة) إلى هذا الجهاز.',
    'Notifications are only available in English right now.':
      'الإشعارات متاحة حاليًا باللغة الإنجليزية فقط.',
    'My Routes': 'خطوطي',
    'Add a route to set up its alerts.': 'أضف خطًا لإعداد تنبيهاته.',
    'No routes added yet. Pick one below.': 'لم تتم إضافة أي خط بعد. اختر واحدًا أدناه.',
    'Notify me if running': 'أعلمني إذا تأخرت',
    'minutes late': 'دقيقة',
    'Notify me during these times if the route is running late:':
      'أعلمني خلال هذه الأوقات إذا كان الخط متأخرًا:',
    'Always': 'دائمًا',
    'Specific times': 'أوقات محددة',
    'From': 'من',
    'To': 'إلى',
    'Add another window': 'إضافة فترة زمنية أخرى',
    'Notify me about reroutes': 'أعلمني عند تغيير المسار',
    'Always sent right away, regardless of the schedule above.':
      'يُرسل دائمًا فورًا، بغض النظر عن الجدول أعلاه.',
    'Add a route': 'إضافة خط',

    // ── Calendar ─────────────────────────────────────────────────────────
    'Previous month': 'الشهر السابق',
    'Next month': 'الشهر التالي',
    'No Service': 'لا خدمة',
    'Gameday': 'يوم المباراة',
    'Summer': 'الصيف',
    'Break': 'عطلة',
    'Regular': 'عادي',
    'Charter': 'رحلة خاصة',
    'No scheduled transit changes today - normal posted hours apply.':
      'لا توجد تغييرات مجدولة في النقل اليوم - تُطبق ساعات العمل العادية المعلنة.',
    'Close': 'إغلاق',

    // ── BTD Map ──────────────────────────────────────────────────────────
    'No routes selected': 'لم يتم اختيار أي خط',
    'Running Today': 'تعمل اليوم',
    'No Weekend Service': 'لا خدمة في عطلة نهاية الأسبوع',

    // ── BTD Schedule ─────────────────────────────────────────────────────
    'Time points repeat every hour, on the same minutes, all day.':
      'تتكرر نقاط التوقيت كل ساعة، في نفس الدقائق، طوال اليوم.',
    'Excluding holidays. No weekend service.': 'باستثناء العطلات الرسمية. لا خدمة في عطلة نهاية الأسبوع.',
    'ROUTES': 'الخطوط',

    // ── BTD Info (fares) ────────────────────────────────────────────────
    'Fixed routes serving Bryan & College Station.': 'خطوط ثابتة تخدم Bryan و College Station.',
    'FIXED ROUTE (ONE-WAY)': 'خط ثابت (اتجاه واحد)',
    'TICKETS & PASSES': 'التذاكر والاشتراكات',
    'REDUCED PASSES': 'اشتراكات مخفضة',
    'WHERE TO BUY TICKETS & PASSES': 'أين تشتري التذاكر والاشتراكات',
    'General Public': 'الجمهور العام',
    'Children (6-12)': 'الأطفال (6-12)',
    'Children under 6 (with paying customer)': 'الأطفال دون سن 6 (برفقة راكب يدفع)',
    'FREE': 'مجاني',
    'Senior / Disabled*': 'كبار السن / ذوو الإعاقة*',
    'Medicare*': 'Medicare*',
    'Blinn / TAMU Students*': 'طلاب Blinn / TAMU*',
    'Day Pass': 'اشتراك يومي',
    'Unlimited trips in one day': 'رحلات غير محدودة في يوم واحد',
    'Weekly Pass': 'اشتراك أسبوعي',
    'Unlimited trips in 5 consecutive weekdays': 'رحلات غير محدودة خلال 5 أيام عمل متتالية',
    'Monthly Pass': 'اشتراك شهري',
    'Unlimited trips in 31 consecutive days': 'رحلات غير محدودة خلال 31 يومًا متتاليًا',
    'Ticket Book': 'دفتر تذاكر',
    '40 one-way trips': '40 رحلة باتجاه واحد',
    'MultiRide Pass': 'اشتراك MultiRide',
    '42 one-way trips': '42 رحلة باتجاه واحد',
    'S&D PunchPass*': 'بطاقة S&D PunchPass*',
    'Purchase over the phone': 'الشراء عبر الهاتف',
    'Stand away from the curb until the bus is completely stopped.':
      'ابتعد عن الرصيف حتى تتوقف الحافلة تمامًا.',
    'Have exact fare ready - drivers do not make change.':
      'جهّز المبلغ الدقيق للأجرة - السائقون لا يعيدون الباقي.',
    'Watch your step getting on and off the bus.': 'انتبه لخطواتك عند الصعود والنزول من الحافلة.',
    'Use the handrails and sit in a seat as soon as possible.':
      'استخدم المقابض واجلس في مقعدك في أقرب وقت ممكن.',
    "Don't let children play or stand on the seats.": 'لا تسمح للأطفال باللعب أو الوقوف على المقاعد.',
    'Be courteous to other passengers.': 'كن مهذبًا مع الركاب الآخرين.',
    'No eating, drinking, smoking, or loud music.': 'يُمنع الأكل أو الشرب أو التدخين أو الموسيقى العالية.',
    'No profanity, racial, or vulgar comments.': 'يُمنع السباب أو التعليقات العنصرية أو البذيئة.',
    'Riding under the influence of alcohol or illegal drugs is prohibited.':
      'يُمنع الركوب تحت تأثير الكحول أو المخدرات غير المشروعة.',
    'All buses are ADA wheelchair accessible (combined customer + mobility aid weight limit: 600 lbs).':
      'جميع الحافلات مجهزة للكراسي المتحركة وفق معايير ADA (الحد الأقصى للوزن الإجمالي للراكب وجهاز التنقل: 600 رطل).',

    // ── Plan a Ride (both AggieSpirit + BTD) ────────────────────────────
    'Plan a Ride': 'خطط لرحلة',
    "This is an estimate from BTD's posted schedule. Buses run Monday-Friday, 5 AM-7 PM only.":
      'هذا تقدير مبني على الجدول الزمني المعلن لـ BTD. تعمل الحافلات من الإثنين إلى الجمعة، من 5 صباحًا حتى 7 مساءً فقط.',
    'Search a stop or address': 'ابحث عن محطة أو عنوان',
    'Clear search': 'مسح البحث',
    'Choose on Map': 'اختر على الخريطة',
    'Swap': 'تبديل',
    'Leave after': 'المغادرة بعد',
    'Arrive by': 'الوصول قبل',
    'Anytime': 'أي وقت',
    'No deadline': 'بلا موعد نهائي',
    'TIMING': 'التوقيت',
    'Set a leave-after or arrive-by time (at least one is required).':
      'حدد وقت المغادرة أو الوصول (واحد على الأقل مطلوب).',
    'Find Routes': 'البحث عن خطوط',
    'Set a leave-after or arrive-by time above to search.':
      'حدد وقت المغادرة أو الوصول أعلاه للبحث.',
    'View Route': 'عرض الخط',
    'Confirm Location': 'تأكيد الموقع',
    'Cancel': 'إلغاء',
    'Done': 'تم',
    'Choose a date': 'اختر تاريخًا',

    // ── Route / stop picker sheets ───────────────────────────────────────
    'Select Routes': 'اختيار الخطوط',
    'Dismiss route picker': 'إغلاق أداة اختيار الخطوط',

    // ── Common ────────────────────────────────────────────────────────────
    'Back': 'رجوع',
    'Loading…': 'جارٍ التحميل…',
    'Search': 'بحث',
  },

  fr: {
    // ── Tab bar ──────────────────────────────────────────────────────────
    'Map': 'Carte',
    'Plan': 'Itinéraire',
    'Calendar': 'Calendrier',
    'More': 'Plus',
    'Schedule': 'Horaires',

    // ── More / Settings (AggieSpirit) ───────────────────────────────────
    'Theme': 'Thème',
    'Light, dark, or follow system': 'Clair, sombre, ou selon le système',
    'Accessibility': 'Accessibilité',
    'Icon/text size, contrast, and motion': 'Taille des icônes/texte, contraste et mouvement',
    'Favorite Routes': 'Lignes favorites',
    'Pin routes to the top of the selector': 'Épingler des lignes en haut du sélecteur',
    'Notifications': 'Notifications',
    'Enable alerts for delays and reroutes': 'Activer les alertes de retard et de déviation',
    'Service Disruptions': 'Perturbations du service',
    'Construction reroutes and closures': 'Déviations et fermetures liées aux travaux',
    'Help Guide': "Guide d'aide",
    'Stop types and tips for riding the bus': "Types d'arrêts et conseils pour prendre le bus",
    'Unit Codes': 'Codes des véhicules',
    '(Experimental)': '(Expérimental)',
    "Shows each unit's letter code (Alpha, Bravo, ...).": 'Affiche le code lettre de chaque véhicule (Alpha, Bravo, ...).',
    'Brazos Transit District': 'Brazos Transit District',
    "Switch to BTD's bus service": 'Passer au service de bus de BTD',
    'Load into BTD': 'Ouvrir directement sur BTD',
    'Open straight to BTD instead of the map when you start the app':
      "Ouvrir directement sur BTD au lieu de la carte au démarrage de l'application",
    'Replay Tutorial': 'Revoir le tutoriel',
    'Watch the first-launch walkthrough again': 'Revoir la présentation du premier lancement',

    // ── More (BTD) ───────────────────────────────────────────────────────
    'Fares, tickets, and contact info': 'Tarifs, billets et coordonnées',
    'AggieSpirit Buses': 'Bus AggieSpirit',
    "Switch back to TAMU's bus service": 'Revenir au service de bus de TAMU',
    "Switches back to TAMU's bus service": 'Revient au service de bus de TAMU',
    "Open straight to BTD instead of the map when you start the app.":
      "Ouvrir directement sur BTD au lieu de la carte au démarrage de l'application.",
    "Opens the app directly to BTD's map on launch": "Ouvre l'application directement sur la carte de BTD au lancement",
    'Info': 'Infos',

    // ── Theme screen ─────────────────────────────────────────────────────
    'System': 'Système',
    'Follow device settings': "Selon les paramètres de l'appareil",
    'Light': 'Clair',
    'Always use light theme': 'Toujours utiliser le thème clair',
    'Dark': 'Sombre',
    'Always use dark theme': 'Toujours utiliser le thème sombre',

    // ── Map provider screen ─────────────────────────────────────────────
    'Apple Maps': 'Apple Plans',
    'Default': 'Par défaut',
    'Google Maps': 'Google Maps',
    'Alternative': 'Alternative',

    // ── Accessibility screen ────────────────────────────────────────────
    'Icon Size': 'Taille des icônes',
    'Scales map markers and tab bar icons. Changing this will close any routes you have open on the map.':
      "Ajuste la taille des repères de carte et des icônes de la barre d'onglets. Cette modification fermera les lignes ouvertes sur la carte.",
    'Text Size': 'Taille du texte',
    'Scales text in the More menu and key screens.': "Ajuste la taille du texte dans le menu Plus et les écrans clés.",
    'High Contrast': 'Contraste élevé',
    'Stronger contrast between text, backgrounds, and borders.': 'Contraste plus fort entre texte, arrière-plans et bordures.',
    'Reduce Motion': 'Réduire les animations',
    'Shortens or removes animations like the tour and panel slides.':
      "Raccourcit ou supprime les animations comme la visite guidée et les panneaux coulissants.",
    'Extra Small': 'Très petit',
    'Small': 'Petit',
    'Large': 'Grand',
    'Extra Large': 'Très grand',
    'Min': 'Min',
    'Max': 'Max',

    // ── Language screen (new) ───────────────────────────────────────────
    'Language': 'Langue',
    'Choose your language': 'Choisissez votre langue',
    'Machine-translated. Wording may be imperfect or occasionally inaccurate - route names, live bus data, and service alerts always show in English.':
      "Traduction automatique. La formulation peut être imparfaite ou parfois inexacte - les noms de lignes, les données de bus en direct et les alertes de service s'affichent toujours en anglais.",

    // ── Favorites screen ─────────────────────────────────────────────────
    'Favorited routes appear at the top of the route selector on the map.':
      'Les lignes favorites apparaissent en haut du sélecteur de lignes sur la carte.',

    // ── Help Guide ───────────────────────────────────────────────────────
    'STOP TYPES': "TYPES D'ARRÊTS",
    'Normal Stop': 'Arrêt normal',
    "Just a regular stop on the route. The driver will stop if a passenger requests the stop or if someone's waiting to board.":
      "Un arrêt ordinaire sur la ligne. Le chauffeur s'arrêtera si un passager le demande ou si quelqu'un attend pour monter.",
    'Timepoint': 'Point de contrôle horaire',
    "Similar to a regular stop, but if the driver is running early, they'll hold here until the scheduled leave time.":
      "Semblable à un arrêt normal, mais si le chauffeur est en avance, il attendra ici jusqu'à l'heure de départ prévue.",
    'Temporary Stop': 'Arrêt temporaire',
    'Like a normal stop, but not permanent. Usually for construction or temporary route changes. Sometimes marked with an A-frame sign, but not always.':
      "Comme un arrêt normal, mais non permanent. Généralement dû à des travaux ou des changements temporaires d'itinéraire. Parfois signalé par un panneau, mais pas toujours.",
    'HOW TO RIDE': 'COMMENT VOYAGER',
    'Stop Request': "Demande d'arrêt",
    "Pull the cord or push the strip when you hear your stop being announced. Otherwise, the driver will keep driving and can only drop you off at the next stop.":
      "Tirez le cordon ou appuyez sur la bande lorsque vous entendez annoncer votre arrêt. Sinon, le chauffeur continuera et ne pourra vous déposer qu'à l'arrêt suivant.",
    'Some routes share stops on the other side of the road. It might be faster or easier to wait for the bus to come back around to the adjacent stop.':
      "Certaines lignes partagent des arrêts de l'autre côté de la route. Il peut être plus rapide ou plus simple d'attendre que le bus revienne à l'arrêt voisin.",
    'Not Every Stop Is Automatic': "Tous les arrêts ne sont pas automatiques",
    'Plan Ahead': "Planifiez à l'avance",
    "Leave earlier than you think you need to, especially during the beginning of the semester or peak riding times.":
      "Partez plus tôt que vous ne le pensez nécessaire, surtout en début de semestre ou aux heures de pointe.",
    "Nobody knows exactly how timing will be affected by traffic, ridership, accidents, etc.":
      "Personne ne peut prédire exactement comment le trafic, l'affluence, les accidents, etc. affecteront les horaires.",
    'Full Bus / "Another Bus Follows"': 'Bus complet / "Un autre bus suit"',
    'Rush Hours': 'Heures de pointe',
    'Expect busses to be running late or full during rush hours: 7-8 AM, class changes, 3 PM, and 5 PM.':
      "Attendez-vous à des bus en retard ou complets aux heures de pointe : 7h-8h, changements de cours, 15h et 17h.",
    'Mobility Devices & Bikes': 'Aides à la mobilité et vélos',
    'TIP': 'ASTUCE',

    // ── Service Disruptions ─────────────────────────────────────────────
    'No active service disruptions.': 'Aucune perturbation de service en cours.',
    'All Routes': 'Toutes les lignes',

    // ── Notifications ────────────────────────────────────────────────────
    'Enable Notifications': 'Activer les notifications',
    'Required before any alerts (delays, detours, service news) can reach this device.':
      "Requis pour que cet appareil puisse recevoir des alertes (retards, déviations, actualités de service).",
    'Notifications are only available in English right now.':
      "Les notifications ne sont actuellement disponibles qu'en anglais.",
    'My Routes': 'Mes lignes',
    'Add a route to set up its alerts.': 'Ajoutez une ligne pour configurer ses alertes.',
    'No routes added yet. Pick one below.': 'Aucune ligne ajoutée pour le moment. Choisissez-en une ci-dessous.',
    'Notify me if running': 'Me prévenir si le retard dépasse',
    'minutes late': 'minutes',
    'Notify me during these times if the route is running late:':
      'Me prévenir pendant ces horaires si la ligne est en retard :',
    'Always': 'Toujours',
    'Specific times': 'Horaires spécifiques',
    'From': 'De',
    'To': 'À',
    'Add another window': 'Ajouter une autre plage horaire',
    'Notify me about reroutes': 'Me prévenir des déviations',
    'Always sent right away, regardless of the schedule above.':
      "Toujours envoyé immédiatement, indépendamment de l'horaire ci-dessus.",
    'Add a route': 'Ajouter une ligne',

    // ── Calendar ─────────────────────────────────────────────────────────
    'Previous month': 'Mois précédent',
    'Next month': 'Mois suivant',
    'No Service': 'Pas de service',
    'Gameday': 'Jour de match',
    'Summer': 'Été',
    'Break': 'Vacances',
    'Regular': 'Normal',
    'Charter': 'Affrété',
    'No scheduled transit changes today - normal posted hours apply.':
      "Aucun changement de service prévu aujourd'hui - les horaires normaux s'appliquent.",
    'Close': 'Fermer',

    // ── BTD Map ──────────────────────────────────────────────────────────
    'No routes selected': 'Aucune ligne sélectionnée',
    'Running Today': "En service aujourd'hui",
    'No Weekend Service': 'Pas de service le week-end',

    // ── BTD Schedule ─────────────────────────────────────────────────────
    'Time points repeat every hour, on the same minutes, all day.':
      'Les points de contrôle horaires se répètent chaque heure, aux mêmes minutes, toute la journée.',
    'Excluding holidays. No weekend service.': 'Sauf jours fériés. Pas de service le week-end.',
    'ROUTES': 'LIGNES',

    // ── BTD Info (fares) ────────────────────────────────────────────────
    'Fixed routes serving Bryan & College Station.': 'Lignes fixes desservant Bryan et College Station.',
    'FIXED ROUTE (ONE-WAY)': 'LIGNE FIXE (ALLER SIMPLE)',
    'TICKETS & PASSES': 'BILLETS ET FORFAITS',
    'REDUCED PASSES': 'FORFAITS RÉDUITS',
    'WHERE TO BUY TICKETS & PASSES': 'OÙ ACHETER DES BILLETS ET FORFAITS',
    'General Public': 'Grand public',
    'Children (6-12)': 'Enfants (6-12 ans)',
    'Children under 6 (with paying customer)': "Enfants de moins de 6 ans (accompagnés d'un client payant)",
    'FREE': 'GRATUIT',
    'Senior / Disabled*': 'Sénior / Personne handicapée*',
    'Medicare*': 'Medicare*',
    'Blinn / TAMU Students*': 'Étudiants Blinn / TAMU*',
    'Day Pass': 'Forfait journée',
    'Unlimited trips in one day': 'Trajets illimités en une journée',
    'Weekly Pass': 'Forfait semaine',
    'Unlimited trips in 5 consecutive weekdays': 'Trajets illimités sur 5 jours ouvrés consécutifs',
    'Monthly Pass': 'Forfait mensuel',
    'Unlimited trips in 31 consecutive days': 'Trajets illimités sur 31 jours consécutifs',
    'Ticket Book': 'Carnet de tickets',
    '40 one-way trips': '40 trajets aller simple',
    'MultiRide Pass': 'Forfait MultiRide',
    '42 one-way trips': '42 trajets aller simple',
    'S&D PunchPass*': 'PunchPass S&D*',
    'Purchase over the phone': 'Achat par téléphone',
    'Stand away from the curb until the bus is completely stopped.':
      "Restez à l'écart du trottoir jusqu'à l'arrêt complet du bus.",
    'Have exact fare ready - drivers do not make change.':
      "Préparez l'appoint exact - les chauffeurs ne font pas de monnaie.",
    'Watch your step getting on and off the bus.': 'Attention à la marche en montant et descendant du bus.',
    'Use the handrails and sit in a seat as soon as possible.':
      "Utilisez les mains courantes et asseyez-vous dès que possible.",
    "Don't let children play or stand on the seats.": 'Ne laissez pas les enfants jouer ou se tenir debout sur les sièges.',
    'Be courteous to other passengers.': 'Soyez courtois envers les autres passagers.',
    'No eating, drinking, smoking, or loud music.': "Interdiction de manger, boire, fumer ou écouter de la musique forte.",
    'No profanity, racial, or vulgar comments.': 'Aucune grossièreté, propos racistes ou vulgaires.',
    'Riding under the influence of alcohol or illegal drugs is prohibited.':
      "Il est interdit de voyager sous l'emprise de l'alcool ou de drogues illégales.",
    'All buses are ADA wheelchair accessible (combined customer + mobility aid weight limit: 600 lbs).':
      "Tous les bus sont accessibles aux fauteuils roulants selon les normes ADA (limite de poids combiné passager + aide à la mobilité : 600 lbs).",

    // ── Plan a Ride (both AggieSpirit + BTD) ────────────────────────────
    'Plan a Ride': 'Planifier un trajet',
    "This is an estimate from BTD's posted schedule. Buses run Monday-Friday, 5 AM-7 PM only.":
      "Ceci est une estimation basée sur l'horaire publié de BTD. Les bus circulent uniquement du lundi au vendredi, de 5h à 19h.",
    'Search a stop or address': 'Rechercher un arrêt ou une adresse',
    'Clear search': 'Effacer la recherche',
    'Choose on Map': 'Choisir sur la carte',
    'Swap': 'Inverser',
    'Leave after': 'Partir après',
    'Arrive by': 'Arriver avant',
    'Anytime': "N'importe quand",
    'No deadline': 'Aucune limite',
    'TIMING': 'HORAIRE',
    'Set a leave-after or arrive-by time (at least one is required).':
      "Définissez une heure de départ ou d'arrivée (au moins une est requise).",
    'Find Routes': 'Rechercher des lignes',
    'Set a leave-after or arrive-by time above to search.':
      "Définissez une heure de départ ou d'arrivée ci-dessus pour rechercher.",
    'View Route': 'Voir la ligne',
    'Confirm Location': "Confirmer l'emplacement",
    'Cancel': 'Annuler',
    'Done': 'Terminé',
    'Choose a date': 'Choisir une date',

    // ── Route / stop picker sheets ───────────────────────────────────────
    'Select Routes': 'Sélectionner des lignes',
    'Dismiss route picker': 'Fermer le sélecteur de lignes',

    // ── Common ────────────────────────────────────────────────────────────
    'Back': 'Retour',
    'Loading…': 'Chargement…',
    'Search': 'Rechercher',
  },

  tl: {
    // ── Tab bar ──────────────────────────────────────────────────────────
    'Map': 'Mapa',
    'Plan': 'Planuhin',
    'Calendar': 'Kalendaryo',
    'More': 'Higit Pa',
    'Schedule': 'Iskedyul',

    // ── More / Settings (AggieSpirit) ───────────────────────────────────
    'Theme': 'Tema',
    'Light, dark, or follow system': 'Maliwanag, madilim, o sundin ang system',
    'Accessibility': 'Accessibility',
    'Icon/text size, contrast, and motion': 'Laki ng icon/text, contrast, at galaw',
    'Favorite Routes': 'Mga Paboritong Ruta',
    'Pin routes to the top of the selector': 'I-pin ang mga ruta sa itaas ng selector',
    'Notifications': 'Mga Notification',
    'Enable alerts for delays and reroutes': 'I-enable ang alerto para sa delay at pagbabago ng ruta',
    'Service Disruptions': 'Mga Abala sa Serbisyo',
    'Construction reroutes and closures': 'Pagbabago ng ruta at pagsara dahil sa konstruksyon',
    'Help Guide': 'Gabay sa Tulong',
    'Stop types and tips for riding the bus': 'Mga uri ng himpilan at tips sa pagsakay ng bus',
    'Unit Codes': 'Code ng Sasakyan',
    '(Experimental)': '(Eksperimental)',
    "Shows each unit's letter code (Alpha, Bravo, ...).": 'Ipinapakita ang letter code ng bawat sasakyan (Alpha, Bravo, ...).',
    'Brazos Transit District': 'Brazos Transit District',
    "Switch to BTD's bus service": 'Lumipat sa serbisyo ng bus ng BTD',
    'Load into BTD': 'Buksan agad sa BTD',
    'Open straight to BTD instead of the map when you start the app':
      'Buksan agad sa BTD sa halip na sa mapa kapag sinimulan ang app',
    'Replay Tutorial': 'Panoorin Muli ang Tutorial',
    'Watch the first-launch walkthrough again': 'Panoorin muli ang unang gabay',

    // ── More (BTD) ───────────────────────────────────────────────────────
    'Fares, tickets, and contact info': 'Pamasahe, tiket, at contact info',
    'AggieSpirit Buses': 'Mga Bus ng AggieSpirit',
    "Switch back to TAMU's bus service": 'Bumalik sa serbisyo ng bus ng TAMU',
    "Switches back to TAMU's bus service": 'Bumabalik sa serbisyo ng bus ng TAMU',
    "Open straight to BTD instead of the map when you start the app.":
      'Buksan agad sa BTD sa halip na sa mapa kapag sinimulan ang app.',
    "Opens the app directly to BTD's map on launch": 'Direktang binubuksan ng app ang mapa ng BTD kapag nagsimula',
    'Info': 'Impormasyon',

    // ── Theme screen ─────────────────────────────────────────────────────
    'System': 'System',
    'Follow device settings': 'Sundin ang setting ng device',
    'Light': 'Maliwanag',
    'Always use light theme': 'Laging gamitin ang light theme',
    'Dark': 'Madilim',
    'Always use dark theme': 'Laging gamitin ang dark theme',

    // ── Map provider screen ─────────────────────────────────────────────
    'Apple Maps': 'Apple Maps',
    'Default': 'Default',
    'Google Maps': 'Google Maps',
    'Alternative': 'Alternatibo',

    // ── Accessibility screen ────────────────────────────────────────────
    'Icon Size': 'Laki ng Icon',
    'Scales map markers and tab bar icons. Changing this will close any routes you have open on the map.':
      'Inaayos ang laki ng mga marker sa mapa at icon sa tab bar. Ang pagbabago nito ay magsasara ng anumang bukas na ruta sa mapa.',
    'Text Size': 'Laki ng Text',
    'Scales text in the More menu and key screens.': 'Inaayos ang laki ng text sa More menu at mga pangunahing screen.',
    'High Contrast': 'High Contrast',
    'Stronger contrast between text, backgrounds, and borders.': 'Mas malakas na contrast sa pagitan ng text, background, at border.',
    'Reduce Motion': 'Bawasan ang Galaw',
    'Shortens or removes animations like the tour and panel slides.':
      'Pinaikli o inaalis ang mga animation tulad ng tour at pag-slide ng panel.',
    'Extra Small': 'Sobrang Liit',
    'Small': 'Maliit',
    'Large': 'Malaki',
    'Extra Large': 'Sobrang Laki',
    'Min': 'Min',
    'Max': 'Max',

    // ── Language screen (new) ───────────────────────────────────────────
    'Language': 'Wika',
    'Choose your language': 'Piliin ang iyong wika',
    'Machine-translated. Wording may be imperfect or occasionally inaccurate - route names, live bus data, and service alerts always show in English.':
      'Machine-translated ito. Maaaring hindi perpekto o minsan hindi tama ang pagkakasalin - ang pangalan ng ruta, live na data ng bus, at mga alerto sa serbisyo ay palaging nasa Ingles.',

    // ── Favorites screen ─────────────────────────────────────────────────
    'Favorited routes appear at the top of the route selector on the map.':
      'Ang mga paboritong ruta ay lumalabas sa itaas ng route selector sa mapa.',

    // ── Help Guide ───────────────────────────────────────────────────────
    'STOP TYPES': 'MGA URI NG HIMPILAN',
    'Normal Stop': 'Normal na Himpilan',
    "Just a regular stop on the route. The driver will stop if a passenger requests the stop or if someone's waiting to board.":
      'Isang regular na himpilan lang sa ruta. Hihinto ang driver kung may hihiling na bumaba o may naghihintay na sumakay.',
    'Timepoint': 'Timepoint',
    "Similar to a regular stop, but if the driver is running early, they'll hold here until the scheduled leave time.":
      'Katulad ng regular na himpilan, pero kung maaga ang driver, maghihintay siya rito hanggang sa iskedyul na oras ng alis.',
    'Temporary Stop': 'Pansamantalang Himpilan',
    'Like a normal stop, but not permanent. Usually for construction or temporary route changes. Sometimes marked with an A-frame sign, but not always.':
      'Katulad ng normal na himpilan, pero hindi permanente. Karaniwang dahil sa konstruksyon o pansamantalang pagbabago ng ruta. Minsan may sign board, pero hindi palagi.',
    'HOW TO RIDE': 'PAANO SUMAKAY',
    'Stop Request': 'Kahilingan sa Paghinto',
    "Pull the cord or push the strip when you hear your stop being announced. Otherwise, the driver will keep driving and can only drop you off at the next stop.":
      'Hilahin ang cord o pindutin ang strip kapag narinig mong nabanggit ang iyong himpilan. Kung hindi, magpapatuloy ang driver at sa susunod na himpilan ka lang mabababa.',
    'Some routes share stops on the other side of the road. It might be faster or easier to wait for the bus to come back around to the adjacent stop.':
      'May mga rutang nagbabahagi ng himpilan sa kabilang panig ng kalsada. Mas mabilis o mas madali minsan na maghintay na bumalik ang bus sa kalapit na himpilan.',
    'Not Every Stop Is Automatic': 'Hindi Lahat ng Himpilan ay Awtomatiko',
    'Plan Ahead': 'Magplano nang Maaga',
    "Leave earlier than you think you need to, especially during the beginning of the semester or peak riding times.":
      'Umalis nang mas maaga sa inaakala mong kailangan, lalo na sa simula ng semestre o sa oras ng maraming pasahero.',
    "Nobody knows exactly how timing will be affected by traffic, ridership, accidents, etc.":
      'Walang makakaalam nang eksakto kung paano maaapektuhan ang oras ng trapiko, dami ng pasahero, aksidente, atbp.',
    'Full Bus / "Another Bus Follows"': 'Puno ang Bus / "May Susunod na Bus"',
    'Rush Hours': 'Oras ng Rush',
    'Expect busses to be running late or full during rush hours: 7-8 AM, class changes, 3 PM, and 5 PM.':
      'Umasang huli o puno ang bus tuwing rush hour: 7-8 AM, pagpapalit ng klase, 3 PM, at 5 PM.',
    'Mobility Devices & Bikes': 'Mobility Device at Bisikleta',
    'TIP': 'TIP',

    // ── Service Disruptions ─────────────────────────────────────────────
    'No active service disruptions.': 'Walang kasalukuyang abala sa serbisyo.',
    'All Routes': 'Lahat ng Ruta',

    // ── Notifications ────────────────────────────────────────────────────
    'Enable Notifications': 'I-enable ang mga Notification',
    'Required before any alerts (delays, detours, service news) can reach this device.':
      'Kailangan bago makarating ang anumang alerto (delay, detour, balita ng serbisyo) sa device na ito.',
    'Notifications are only available in English right now.':
      'Sa Ingles lang muna available ang mga notification.',
    'My Routes': 'Aking mga Ruta',
    'Add a route to set up its alerts.': 'Magdagdag ng ruta para i-set up ang mga alerto nito.',
    'No routes added yet. Pick one below.': 'Wala pang ruta na naidagdag. Pumili sa ibaba.',
    'Notify me if running': 'Ipaalam sa akin kung',
    'minutes late': 'minutong huli',
    'Notify me during these times if the route is running late:':
      'Ipaalam sa akin sa mga oras na ito kung huli ang ruta:',
    'Always': 'Palagi',
    'Specific times': 'Tiyak na Oras',
    'From': 'Mula',
    'To': 'Hanggang',
    'Add another window': 'Magdagdag ng ibang oras',
    'Notify me about reroutes': 'Ipaalam sa akin ang mga reroute',
    'Always sent right away, regardless of the schedule above.':
      'Palaging agad na ipinapadala, anuman ang iskedyul sa itaas.',
    'Add a route': 'Magdagdag ng ruta',

    // ── Calendar ─────────────────────────────────────────────────────────
    'Previous month': 'Nakaraang buwan',
    'Next month': 'Susunod na buwan',
    'No Service': 'Walang Serbisyo',
    'Gameday': 'Araw ng Laro',
    'Summer': 'Tag-init',
    'Break': 'Bakasyon',
    'Regular': 'Regular',
    'Charter': 'Charter',
    'No scheduled transit changes today - normal posted hours apply.':
      'Walang naka-iskedyul na pagbabago sa transit ngayon - normal na oras ang ipinatutupad.',
    'Close': 'Isara',

    // ── BTD Map ──────────────────────────────────────────────────────────
    'No routes selected': 'Walang napiling ruta',
    'Running Today': 'Tumatakbo Ngayon',
    'No Weekend Service': 'Walang serbisyo tuwing weekend',

    // ── BTD Schedule ─────────────────────────────────────────────────────
    'Time points repeat every hour, on the same minutes, all day.':
      'Ang mga timepoint ay umuulit bawat oras, sa parehong minuto, buong araw.',
    'Excluding holidays. No weekend service.': 'Hindi kasama ang mga holiday. Walang serbisyo tuwing weekend.',
    'ROUTES': 'MGA RUTA',

    // ── BTD Info (fares) ────────────────────────────────────────────────
    'Fixed routes serving Bryan & College Station.': 'Mga fixed na ruta na naglilingkod sa Bryan at College Station.',
    'FIXED ROUTE (ONE-WAY)': 'FIXED ROUTE (ISANG DAAN)',
    'TICKETS & PASSES': 'MGA TIKET AT PASS',
    'REDUCED PASSES': 'MGA DISKUWENTONG PASS',
    'WHERE TO BUY TICKETS & PASSES': 'SAAN BUMILI NG TIKET AT PASS',
    'General Public': 'Pangkalahatang Publiko',
    'Children (6-12)': 'Mga Bata (6-12)',
    'Children under 6 (with paying customer)': 'Mga batang wala pang 6 (kasama ang nagbabayad na pasahero)',
    'FREE': 'LIBRE',
    'Senior / Disabled*': 'Senior / May Kapansanan*',
    'Medicare*': 'Medicare*',
    'Blinn / TAMU Students*': 'Mga Estudyante ng Blinn / TAMU*',
    'Day Pass': 'Day Pass',
    'Unlimited trips in one day': 'Walang limitasyon na biyahe sa isang araw',
    'Weekly Pass': 'Weekly Pass',
    'Unlimited trips in 5 consecutive weekdays': 'Walang limitasyon na biyahe sa 5 magkakasunod na weekday',
    'Monthly Pass': 'Monthly Pass',
    'Unlimited trips in 31 consecutive days': 'Walang limitasyon na biyahe sa 31 magkakasunod na araw',
    'Ticket Book': 'Ticket Book',
    '40 one-way trips': '40 na isang-daang biyahe',
    'MultiRide Pass': 'MultiRide Pass',
    '42 one-way trips': '42 na isang-daang biyahe',
    'S&D PunchPass*': 'S&D PunchPass*',
    'Purchase over the phone': 'Bumili sa telepono',
    'Stand away from the curb until the bus is completely stopped.':
      'Lumayo sa gilid ng bangketa hanggang tuluyang huminto ang bus.',
    'Have exact fare ready - drivers do not make change.':
      'Ihanda ang eksaktong bayad - hindi nagbibigay ng sukli ang mga driver.',
    'Watch your step getting on and off the bus.': 'Mag-ingat sa hakbang kapag sumasakay o bumababa sa bus.',
    'Use the handrails and sit in a seat as soon as possible.':
      'Gamitin ang handrail at umupo agad kung maaari.',
    "Don't let children play or stand on the seats.": 'Huwag payagan ang mga bata na maglaro o tumayo sa upuan.',
    'Be courteous to other passengers.': 'Maging magalang sa ibang pasahero.',
    'No eating, drinking, smoking, or loud music.': 'Bawal kumain, uminom, manigarilyo, o maglaro ng malakas na musika.',
    'No profanity, racial, or vulgar comments.': 'Bawal ang mura, mapanlait sa lahi, o bulgar na komento.',
    'Riding under the influence of alcohol or illegal drugs is prohibited.':
      'Bawal sumakay habang lasing o naka-ilegal na droga.',
    'All buses are ADA wheelchair accessible (combined customer + mobility aid weight limit: 600 lbs).':
      'Lahat ng bus ay ADA wheelchair-accessible (kabuuang timbang ng pasahero + mobility aid na limitasyon: 600 lbs).',

    // ── Plan a Ride (both AggieSpirit + BTD) ────────────────────────────
    'Plan a Ride': 'Magplano ng Biyahe',
    "This is an estimate from BTD's posted schedule. Buses run Monday-Friday, 5 AM-7 PM only.":
      'Isang pagtatantya ito batay sa nai-post na iskedyul ng BTD. Tumatakbo lang ang mga bus Lunes-Biyernes, 5 AM-7 PM.',
    'Search a stop or address': 'Maghanap ng himpilan o address',
    'Clear search': 'I-clear ang paghahanap',
    'Choose on Map': 'Piliin sa Mapa',
    'Swap': 'Ipagpalit',
    'Leave after': 'Aalis pagkatapos ng',
    'Arrive by': 'Darating bago ang',
    'Anytime': 'Kahit anong oras',
    'No deadline': 'Walang deadline',
    'TIMING': 'ORAS',
    'Set a leave-after or arrive-by time (at least one is required).':
      'Mag-set ng oras ng pag-alis o pagdating (kailangan ng kahit isa).',
    'Find Routes': 'Maghanap ng Ruta',
    'Set a leave-after or arrive-by time above to search.':
      'Mag-set ng oras sa itaas para maghanap.',
    'View Route': 'Tingnan ang Ruta',
    'Confirm Location': 'Kumpirmahin ang Lokasyon',
    'Cancel': 'Kanselahin',
    'Done': 'Tapos na',
    'Choose a date': 'Pumili ng petsa',

    // ── Route / stop picker sheets ───────────────────────────────────────
    'Select Routes': 'Pumili ng mga Ruta',
    'Dismiss route picker': 'Isara ang route picker',

    // ── Common ────────────────────────────────────────────────────────────
    'Back': 'Bumalik',
    'Loading…': 'Naglo-load…',
    'Search': 'Maghanap',
  },

  pt: {
    // ── Tab bar ──────────────────────────────────────────────────────────
    'Map': 'Mapa',
    'Plan': 'Planejar',
    'Calendar': 'Calendário',
    'More': 'Mais',
    'Schedule': 'Horário',

    // ── More / Settings (AggieSpirit) ───────────────────────────────────
    'Theme': 'Tema',
    'Light, dark, or follow system': 'Claro, escuro, ou seguir o sistema',
    'Accessibility': 'Acessibilidade',
    'Icon/text size, contrast, and motion': 'Tamanho de ícones/texto, contraste e movimento',
    'Favorite Routes': 'Rotas Favoritas',
    'Pin routes to the top of the selector': 'Fixar rotas no topo do seletor',
    'Notifications': 'Notificações',
    'Enable alerts for delays and reroutes': 'Ativar alertas de atrasos e desvios',
    'Service Disruptions': 'Interrupções de Serviço',
    'Construction reroutes and closures': 'Desvios e fechamentos por obras',
    'Help Guide': 'Guia de Ajuda',
    'Stop types and tips for riding the bus': 'Tipos de parada e dicas para andar de ônibus',
    'Unit Codes': 'Códigos de Unidade',
    '(Experimental)': '(Experimental)',
    "Shows each unit's letter code (Alpha, Bravo, ...).": 'Mostra o código de letra de cada unidade (Alpha, Bravo, ...).',
    'Brazos Transit District': 'Brazos Transit District',
    "Switch to BTD's bus service": 'Mudar para o serviço de ônibus da BTD',
    'Load into BTD': 'Abrir direto na BTD',
    'Open straight to BTD instead of the map when you start the app':
      'Abrir direto na BTD em vez do mapa ao iniciar o aplicativo',
    'Replay Tutorial': 'Rever Tutorial',
    'Watch the first-launch walkthrough again': 'Assistir novamente ao tutorial inicial',

    // ── More (BTD) ───────────────────────────────────────────────────────
    'Fares, tickets, and contact info': 'Tarifas, passagens e informações de contato',
    'AggieSpirit Buses': 'Ônibus AggieSpirit',
    "Switch back to TAMU's bus service": 'Voltar ao serviço de ônibus da TAMU',
    "Switches back to TAMU's bus service": 'Volta ao serviço de ônibus da TAMU',
    "Open straight to BTD instead of the map when you start the app.":
      'Abrir direto na BTD em vez do mapa ao iniciar o aplicativo.',
    "Opens the app directly to BTD's map on launch": 'Abre o aplicativo diretamente no mapa da BTD ao iniciar',
    'Info': 'Informações',

    // ── Theme screen ─────────────────────────────────────────────────────
    'System': 'Sistema',
    'Follow device settings': 'Seguir configurações do dispositivo',
    'Light': 'Claro',
    'Always use light theme': 'Sempre usar tema claro',
    'Dark': 'Escuro',
    'Always use dark theme': 'Sempre usar tema escuro',

    // ── Map provider screen ─────────────────────────────────────────────
    'Apple Maps': 'Apple Maps',
    'Default': 'Padrão',
    'Google Maps': 'Google Maps',
    'Alternative': 'Alternativa',

    // ── Accessibility screen ────────────────────────────────────────────
    'Icon Size': 'Tamanho dos Ícones',
    'Scales map markers and tab bar icons. Changing this will close any routes you have open on the map.':
      'Ajusta o tamanho dos marcadores do mapa e ícones da barra de abas. Alterar isso fechará quaisquer rotas abertas no mapa.',
    'Text Size': 'Tamanho do Texto',
    'Scales text in the More menu and key screens.': 'Ajusta o tamanho do texto no menu Mais e telas principais.',
    'High Contrast': 'Alto Contraste',
    'Stronger contrast between text, backgrounds, and borders.': 'Contraste mais forte entre texto, fundos e bordas.',
    'Reduce Motion': 'Reduzir Movimento',
    'Shortens or removes animations like the tour and panel slides.':
      'Encurta ou remove animações como o tour e deslizamentos de painéis.',
    'Extra Small': 'Extra Pequeno',
    'Small': 'Pequeno',
    'Large': 'Grande',
    'Extra Large': 'Extra Grande',
    'Min': 'Mín',
    'Max': 'Máx',

    // ── Language screen (new) ───────────────────────────────────────────
    'Language': 'Idioma',
    'Choose your language': 'Escolha seu idioma',
    'Machine-translated. Wording may be imperfect or occasionally inaccurate - route names, live bus data, and service alerts always show in English.':
      'Traduzido automaticamente. O texto pode ser imperfeito ou ocasionalmente impreciso - nomes de rotas, dados de ônibus em tempo real e alertas de serviço sempre aparecem em inglês.',

    // ── Favorites screen ─────────────────────────────────────────────────
    'Favorited routes appear at the top of the route selector on the map.':
      'As rotas favoritas aparecem no topo do seletor de rotas no mapa.',

    // ── Help Guide ───────────────────────────────────────────────────────
    'STOP TYPES': 'TIPOS DE PARADA',
    'Normal Stop': 'Parada Normal',
    "Just a regular stop on the route. The driver will stop if a passenger requests the stop or if someone's waiting to board.":
      'Apenas uma parada comum na rota. O motorista para se um passageiro solicitar ou se alguém estiver esperando para embarcar.',
    'Timepoint': 'Ponto de Controle',
    "Similar to a regular stop, but if the driver is running early, they'll hold here until the scheduled leave time.":
      'Semelhante a uma parada comum, mas se o motorista estiver adiantado, ele aguardará aqui até o horário programado de partida.',
    'Temporary Stop': 'Parada Temporária',
    'Like a normal stop, but not permanent. Usually for construction or temporary route changes. Sometimes marked with an A-frame sign, but not always.':
      'Como uma parada normal, mas não permanente. Geralmente por obras ou mudanças temporárias de rota. Às vezes marcada com uma placa, mas nem sempre.',
    'HOW TO RIDE': 'COMO VIAJAR',
    'Stop Request': 'Solicitação de Parada',
    "Pull the cord or push the strip when you hear your stop being announced. Otherwise, the driver will keep driving and can only drop you off at the next stop.":
      'Puxe o cordão ou pressione a faixa quando ouvir sua parada sendo anunciada. Caso contrário, o motorista continuará dirigindo e só poderá deixá-lo na próxima parada.',
    'Some routes share stops on the other side of the road. It might be faster or easier to wait for the bus to come back around to the adjacent stop.':
      'Algumas rotas compartilham paradas do outro lado da rua. Pode ser mais rápido ou fácil esperar o ônibus voltar até a parada adjacente.',
    'Not Every Stop Is Automatic': 'Nem Toda Parada É Automática',
    'Plan Ahead': 'Planeje com Antecedência',
    "Leave earlier than you think you need to, especially during the beginning of the semester or peak riding times.":
      'Saia mais cedo do que acha necessário, especialmente no início do semestre ou em horários de pico.',
    "Nobody knows exactly how timing will be affected by traffic, ridership, accidents, etc.":
      'Ninguém sabe exatamente como o trânsito, a quantidade de passageiros, acidentes, etc. afetarão os horários.',
    'Full Bus / "Another Bus Follows"': 'Ônibus Lotado / "Outro Ônibus Vem a Seguir"',
    'Rush Hours': 'Horários de Pico',
    'Expect busses to be running late or full during rush hours: 7-8 AM, class changes, 3 PM, and 5 PM.':
      'Espere ônibus atrasados ou lotados nos horários de pico: 7h-8h, trocas de aula, 15h e 17h.',
    'Mobility Devices & Bikes': 'Dispositivos de Mobilidade e Bicicletas',
    'TIP': 'DICA',

    // ── Service Disruptions ─────────────────────────────────────────────
    'No active service disruptions.': 'Nenhuma interrupção de serviço ativa.',
    'All Routes': 'Todas as Rotas',

    // ── Notifications ────────────────────────────────────────────────────
    'Enable Notifications': 'Ativar Notificações',
    'Required before any alerts (delays, detours, service news) can reach this device.':
      'Necessário antes que qualquer alerta (atrasos, desvios, notícias de serviço) chegue a este dispositivo.',
    'Notifications are only available in English right now.':
      'As notificações estão disponíveis apenas em inglês no momento.',
    'My Routes': 'Minhas Rotas',
    'Add a route to set up its alerts.': 'Adicione uma rota para configurar seus alertas.',
    'No routes added yet. Pick one below.': 'Nenhuma rota adicionada ainda. Escolha uma abaixo.',
    'Notify me if running': 'Avisar-me se estiver',
    'minutes late': 'minutos atrasado',
    'Notify me during these times if the route is running late:':
      'Avisar-me durante esses horários se a rota estiver atrasada:',
    'Always': 'Sempre',
    'Specific times': 'Horários específicos',
    'From': 'De',
    'To': 'Até',
    'Add another window': 'Adicionar outro horário',
    'Notify me about reroutes': 'Avisar-me sobre desvios',
    'Always sent right away, regardless of the schedule above.':
      'Sempre enviado imediatamente, independentemente do horário acima.',
    'Add a route': 'Adicionar rota',

    // ── Calendar ─────────────────────────────────────────────────────────
    'Previous month': 'Mês anterior',
    'Next month': 'Próximo mês',
    'No Service': 'Sem Serviço',
    'Gameday': 'Dia de Jogo',
    'Summer': 'Verão',
    'Break': 'Recesso',
    'Regular': 'Regular',
    'Charter': 'Fretado',
    'No scheduled transit changes today - normal posted hours apply.':
      'Nenhuma mudança de transporte programada hoje - os horários normais publicados se aplicam.',
    'Close': 'Fechar',

    // ── BTD Map ──────────────────────────────────────────────────────────
    'No routes selected': 'Nenhuma rota selecionada',
    'Running Today': 'Em operação hoje',
    'No Weekend Service': 'Sem serviço nos fins de semana',

    // ── BTD Schedule ─────────────────────────────────────────────────────
    'Time points repeat every hour, on the same minutes, all day.':
      'Os pontos de controle se repetem a cada hora, nos mesmos minutos, o dia todo.',
    'Excluding holidays. No weekend service.': 'Exceto feriados. Sem serviço nos fins de semana.',
    'ROUTES': 'ROTAS',

    // ── BTD Info (fares) ────────────────────────────────────────────────
    'Fixed routes serving Bryan & College Station.': 'Rotas fixas atendendo Bryan e College Station.',
    'FIXED ROUTE (ONE-WAY)': 'ROTA FIXA (SOMENTE IDA)',
    'TICKETS & PASSES': 'PASSAGENS E BILHETES',
    'REDUCED PASSES': 'BILHETES COM DESCONTO',
    'WHERE TO BUY TICKETS & PASSES': 'ONDE COMPRAR PASSAGENS E BILHETES',
    'General Public': 'Público em geral',
    'Children (6-12)': 'Crianças (6-12)',
    'Children under 6 (with paying customer)': 'Crianças menores de 6 anos (acompanhadas de passageiro pagante)',
    'FREE': 'GRÁTIS',
    'Senior / Disabled*': 'Idoso / Pessoa com deficiência*',
    'Medicare*': 'Medicare*',
    'Blinn / TAMU Students*': 'Estudantes Blinn / TAMU*',
    'Day Pass': 'Passe Diário',
    'Unlimited trips in one day': 'Viagens ilimitadas em um dia',
    'Weekly Pass': 'Passe Semanal',
    'Unlimited trips in 5 consecutive weekdays': 'Viagens ilimitadas em 5 dias úteis consecutivos',
    'Monthly Pass': 'Passe Mensal',
    'Unlimited trips in 31 consecutive days': 'Viagens ilimitadas em 31 dias consecutivos',
    'Ticket Book': 'Talão de Passagens',
    '40 one-way trips': '40 viagens só de ida',
    'MultiRide Pass': 'Passe MultiRide',
    '42 one-way trips': '42 viagens só de ida',
    'S&D PunchPass*': 'PunchPass S&D*',
    'Purchase over the phone': 'Compra por telefone',
    'Stand away from the curb until the bus is completely stopped.':
      'Fique afastado do meio-fio até o ônibus parar completamente.',
    'Have exact fare ready - drivers do not make change.':
      'Tenha o valor exato em mãos - os motoristas não dão troco.',
    'Watch your step getting on and off the bus.': 'Cuidado ao subir e descer do ônibus.',
    'Use the handrails and sit in a seat as soon as possible.':
      'Use os corrimãos e sente-se assim que possível.',
    "Don't let children play or stand on the seats.": 'Não deixe as crianças brincarem ou ficarem em pé nos bancos.',
    'Be courteous to other passengers.': 'Seja educado com os outros passageiros.',
    'No eating, drinking, smoking, or loud music.': 'Proibido comer, beber, fumar ou tocar música alta.',
    'No profanity, racial, or vulgar comments.': 'Proibido palavrões ou comentários racistas ou vulgares.',
    'Riding under the influence of alcohol or illegal drugs is prohibited.':
      'É proibido viajar sob efeito de álcool ou drogas ilegais.',
    'All buses are ADA wheelchair accessible (combined customer + mobility aid weight limit: 600 lbs).':
      'Todos os ônibus são acessíveis para cadeira de rodas conforme a ADA (limite de peso combinado do passageiro + dispositivo de mobilidade: 600 lbs).',

    // ── Plan a Ride (both AggieSpirit + BTD) ────────────────────────────
    'Plan a Ride': 'Planejar uma Viagem',
    "This is an estimate from BTD's posted schedule. Buses run Monday-Friday, 5 AM-7 PM only.":
      'Esta é uma estimativa com base no horário publicado da BTD. Os ônibus circulam apenas de segunda a sexta, das 5h às 19h.',
    'Search a stop or address': 'Buscar uma parada ou endereço',
    'Clear search': 'Limpar busca',
    'Choose on Map': 'Escolher no Mapa',
    'Swap': 'Trocar',
    'Leave after': 'Sair depois de',
    'Arrive by': 'Chegar até',
    'Anytime': 'Qualquer horário',
    'No deadline': 'Sem prazo',
    'TIMING': 'HORÁRIO',
    'Set a leave-after or arrive-by time (at least one is required).':
      'Defina um horário de saída ou chegada (pelo menos um é obrigatório).',
    'Find Routes': 'Buscar Rotas',
    'Set a leave-after or arrive-by time above to search.':
      'Defina um horário de saída ou chegada acima para buscar.',
    'View Route': 'Ver Rota',
    'Confirm Location': 'Confirmar Localização',
    'Cancel': 'Cancelar',
    'Done': 'Concluído',
    'Choose a date': 'Escolher uma data',

    // ── Route / stop picker sheets ───────────────────────────────────────
    'Select Routes': 'Selecionar Rotas',
    'Dismiss route picker': 'Fechar seletor de rotas',

    // ── Common ────────────────────────────────────────────────────────────
    'Back': 'Voltar',
    'Loading…': 'Carregando…',
    'Search': 'Buscar',
  },
};

export function translate(text: string, language: LanguageCode): string {
  if (language === 'en') return text;
  return TRANSLATIONS[language]?.[text] ?? text;
}
