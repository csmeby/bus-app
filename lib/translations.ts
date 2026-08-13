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
    'Settings': 'Configuración',
    'Theme, Language, and Accessibility': 'Tema, idioma y accesibilidad',

    // ── Tour, Help Guide, and misc (new) ────────────────────────────────
    'of': 'de',
    'Skip': 'Omitir',
    'Skip tour': 'Omitir recorrido',
    'Finish': 'Finalizar',
    'Finish tour': 'Finalizar recorrido',
    'Next': 'Siguiente',
    'Pick Your Routes': 'Elige tus rutas',
    'Tap here to choose which routes show live buses on the map.':
      'Toca aquí para elegir qué rutas muestran autobuses en vivo en el mapa.',
    'Pin the routes you ride most so they sort to the top of the selector.':
      'Fija las rutas que más usas para que aparezcan primero en el selector.',
    'Turn on alerts for delays and reroutes on your routes.': 'Activa alertas de retrasos y desvíos en tus rutas.',
    'Riding BTD?': '¿Viajas en BTD?',
    'Switch over to Brazos Transit District from here anytime - or set it as your default in the toggle right below.':
      'Cambia a Brazos Transit District desde aquí en cualquier momento - o configúralo como predeterminado con el interruptor de abajo.',
    'New Here?': '¿Eres nuevo aquí?',
    'The Help Guide covers stop types and tips for riding the bus.':
      'La Guía de ayuda cubre los tipos de parada y consejos para viajar en autobús.',
    'Normal Stop': 'Parada normal',
    "Just a regular stop on the route. The driver will stop if a passenger requests the stop or if someone's waiting to board.":
      'Una parada regular de la ruta. El conductor se detendrá si un pasajero solicita la parada o si alguien espera para subir.',
    'Timepoint': 'Punto de control',
    "Similar to a regular stop, but if the driver is running early, they'll hold here until the scheduled leave time.":
      'Similar a una parada regular, pero si el conductor va adelantado, esperará aquí hasta la hora de salida programada.',
    'Temporary Stop': 'Parada temporal',
    'Like a normal stop, but not permanent. Usually for construction or temporary route changes. Sometimes marked with an A-frame sign, but not always.':
      'Como una parada normal, pero no permanente. Generalmente por construcción o cambios temporales de ruta. A veces marcada con un letrero tipo caballete, pero no siempre.',
    'STOP TYPES': 'TIPOS DE PARADA',
    'HOW TO RIDE': 'CÓMO VIAJAR',
    'TIP': 'CONSEJO',
    'Stop Request': 'Solicitud de parada',
    'Pull the cord or push the strip when you hear your stop being announced. Otherwise, the driver will keep driving and can only drop you off at the next stop.':
      'Tira del cordón o presiona la franja cuando escuches anunciar tu parada. De lo contrario, el conductor seguirá conduciendo y solo podrá dejarte en la siguiente parada.',
    'Some routes share stops on the other side of the road. It might be faster or easier to wait for the bus to come back around to the adjacent stop.':
      'Algunas rutas comparten paradas al otro lado de la calle. Puede ser más rápido o fácil esperar a que el autobús regrese a la parada adyacente.',
    'Not Every Stop Is Automatic': 'No todas las paradas son automáticas',
    "If no one's waiting at the stop, the bus isn't stopping.\n\nDrivers aren't required to stop at any stop unless they're running ahead of schedule (at a timepoint), have passengers to pick up, or you requested it.":
      'Si no hay nadie esperando en la parada, el autobús no se detiene.\n\nLos conductores no están obligados a detenerse en ninguna parada a menos que vayan adelantados (en un punto de control), tengan pasajeros que recoger, o lo hayas solicitado.',
    'Plan Ahead': 'Planifica con anticipación',
    'Leave earlier than you think you need to, especially during the beginning of the semester or peak riding times.\n\nNobody knows exactly how timing will be affected by traffic, ridership, accidents, etc.':
      'Sal más temprano de lo que crees necesario, especialmente al inicio del semestre o en horas pico.\n\nNadie sabe exactamente cómo el tráfico, la cantidad de pasajeros, los accidentes, etc. afectarán los tiempos.',
    'Full Bus / "Another Bus Follows"': 'Autobús lleno / "Otro autobús sigue"',
    'Backpacks off, move back, make two rows. The busses can fit about 70 people. If a bus has to leave you behind, there\'s always another one behind it.\n\n"Another Bus Follows" on the marquee means the bus is full and will only stop to let people off. You will have to catch the next one.':
      'Quítate la mochila, muévete hacia atrás, forma dos filas. Los autobuses caben unas 70 personas. Si un autobús tiene que dejarte, siempre hay otro detrás.\n\n"Otro autobús sigue" en el letrero significa que el autobús está lleno y solo se detendrá para dejar bajar pasajeros. Tendrás que tomar el siguiente.',
    'Rush Hours': 'Horas pico',
    'Expect busses to be running late or full during rush hours: 7-8 AM, class changes, 3 PM, and 5 PM.':
      'Espera que los autobuses vayan retrasados o llenos durante las horas pico: 7-8 AM, cambios de clase, 3 PM y 5 PM.',
    'Mobility Devices & Bikes': 'Dispositivos de movilidad y bicicletas',
    "Scooters, one-wheels, and similar devices need to be folded and stowed under a seat. Bikes are not allowed on buses.\n\nIf you can't take it on the bus, park it or ride it. These items are trip hazards and become projectiles in accidents. Please be courteous to everyone else.":
      'Los scooters, one-wheels y dispositivos similares deben plegarse y guardarse bajo un asiento. No se permiten bicicletas en los autobuses.\n\nSi no puedes llevarlo en el autobús, estaciónalo o condúcelo. Estos artículos son riesgos de tropiezo y se convierten en proyectiles en accidentes. Por favor sé considerado con los demás.',
    'Uses a stronger-contrast color palette throughout the app': 'Usa una paleta de colores de mayor contraste en toda la app',
    "Shortens or removes the app's animations": 'Acorta o elimina las animaciones de la app',
    'Monday - Friday, 5:00 AM - 7:00 PM': 'Lunes a viernes, 5:00 AM - 7:00 PM',
    '*Must present a valid student, faculty, or staff ID.':
      '*Debe presentar una identificación válida de estudiante, profesor o personal.',
    '*S&D Punch Passes are only available to clients who have been issued either a S-Pass or D-Pass card.':
      '*Los pases S&D Punch solo están disponibles para clientes con una tarjeta S-Pass o D-Pass.',
    'Monday – Friday, 5:00 AM – 7:00 PM': 'Lunes a viernes, 5:00 AM - 7:00 PM',
    'MORE SERVICES': 'MÁS SERVICIOS',
    'For info about Senior/Disabled & Medicare passes, ADA Paratransit, and Demand & Response service, visit':
      'Para información sobre pases de adultos mayores/discapacitados y Medicare, ADA Paratransit, y servicio de demanda y respuesta, visita',
    'or call': 'o llama al',
    'RIDING POLICY': 'POLÍTICA DE VIAJE',
    'CONTACT & QUESTIONS': 'CONTACTO Y PREGUNTAS',
    'Calls BTD': 'Llama a BTD',
    'Trip planning & general info': 'Planificación de viajes e información general',
    'Opens in your browser': 'Se abre en tu navegador',
    'Website': 'Sitio web',
    'Social media': 'Redes sociales',
    "Shows this day's transit schedule changes": 'Muestra los cambios de horario de tránsito de este día',
    'Dismiss': 'Cerrar',
    'Sunday': 'Domingo',
    'Monday': 'Lunes',
    'Tuesday': 'Martes',
    'Wednesday': 'Miércoles',
    'Thursday': 'Jueves',
    'Friday': 'Viernes',
    'Saturday': 'Sábado',

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
    'Settings': '设置',
    'Theme, Language, and Accessibility': '主题、语言和辅助功能',

    // ── Tour, Help Guide, and misc (new) ────────────────────────────────
    'of': '/',
    'Skip': '跳过',
    'Skip tour': '跳过导览',
    'Finish': '完成',
    'Finish tour': '完成导览',
    'Next': '下一步',
    'Pick Your Routes': '选择你的路线',
    'Tap here to choose which routes show live buses on the map.': '点击这里选择在地图上显示实时公交的路线。',
    'Pin the routes you ride most so they sort to the top of the selector.': '将你常坐的路线置顶，排在选择器最前面。',
    'Turn on alerts for delays and reroutes on your routes.': '为你的路线开启延误和改道提醒。',
    'Riding BTD?': '要搭乘 BTD 吗？',
    'Switch over to Brazos Transit District from here anytime - or set it as your default in the toggle right below.':
      '随时可以从这里切换到 Brazos Transit District - 或在下方开关中将其设为默认。',
    'New Here?': '第一次使用？',
    'The Help Guide covers stop types and tips for riding the bus.': '帮助指南介绍了站点类型和乘车小贴士。',
    'Normal Stop': '普通站',
    "Just a regular stop on the route. The driver will stop if a passenger requests the stop or if someone's waiting to board.":
      '路线上的普通站点。如果乘客要求停靠，或有人等待上车，司机会停车。',
    'Timepoint': '控制点',
    "Similar to a regular stop, but if the driver is running early, they'll hold here until the scheduled leave time.":
      '类似普通站，但如果司机提前到达，会在此等待到预定发车时间。',
    'Temporary Stop': '临时站',
    'Like a normal stop, but not permanent. Usually for construction or temporary route changes. Sometimes marked with an A-frame sign, but not always.':
      '类似普通站，但不是永久性的。通常用于施工或临时路线变更，有时会用A字牌标示，但不总是如此。',
    'STOP TYPES': '站点类型',
    'HOW TO RIDE': '乘车指南',
    'TIP': '提示',
    'Stop Request': '下车请求',
    'Pull the cord or push the strip when you hear your stop being announced. Otherwise, the driver will keep driving and can only drop you off at the next stop.':
      '听到播报你的站点时，拉动拉绳或按压提示条。否则司机会继续行驶，只能在下一站让你下车。',
    'Some routes share stops on the other side of the road. It might be faster or easier to wait for the bus to come back around to the adjacent stop.':
      '有些路线在马路对面共用站点。等公交绕回相邻站点可能更快或更方便。',
    'Not Every Stop Is Automatic': '并非每站都会自动停靠',
    "If no one's waiting at the stop, the bus isn't stopping.\n\nDrivers aren't required to stop at any stop unless they're running ahead of schedule (at a timepoint), have passengers to pick up, or you requested it.":
      '如果站点没有人等车，公交车不会停靠。\n\n除非司机提前到达（在控制点）、有乘客要上车，或你提出了请求，否则司机没有义务在任何站点停车。',
    'Plan Ahead': '提前规划',
    'Leave earlier than you think you need to, especially during the beginning of the semester or peak riding times.\n\nNobody knows exactly how timing will be affected by traffic, ridership, accidents, etc.':
      '比你以为需要的时间更早出发，尤其是在学期开始或高峰乘车时段。\n\n没有人能确切知道交通、客流量、事故等会如何影响时间安排。',
    'Full Bus / "Another Bus Follows"': '车满 / "后面还有一班车"',
    'Backpacks off, move back, make two rows. The busses can fit about 70 people. If a bus has to leave you behind, there\'s always another one behind it.\n\n"Another Bus Follows" on the marquee means the bus is full and will only stop to let people off. You will have to catch the next one.':
      '摘下背包，往后走，排成两排。公交车大约能容纳70人。如果一辆车无法载你，后面总会有下一班。\n\n显示屏上的"后面还有一班车"意味着这辆车已满，只会停车让乘客下车。你需要搭乘下一班。',
    'Rush Hours': '高峰时段',
    'Expect busses to be running late or full during rush hours: 7-8 AM, class changes, 3 PM, and 5 PM.':
      '高峰时段（上午7-8点、换课时间、下午3点和5点）公交可能会延误或满员。',
    'Mobility Devices & Bikes': '助行设备与自行车',
    "Scooters, one-wheels, and similar devices need to be folded and stowed under a seat. Bikes are not allowed on buses.\n\nIf you can't take it on the bus, park it or ride it. These items are trip hazards and become projectiles in accidents. Please be courteous to everyone else.":
      '滑板车、独轮车等类似设备需折叠后放在座位下方。自行车不允许带上车。\n\n如果无法带上车，请停放或骑行前往。这些物品是绊倒隐患，事故中还可能成为抛射物。请为他人着想。',
    'Uses a stronger-contrast color palette throughout the app': '在整个应用中使用对比度更强的配色方案',
    "Shortens or removes the app's animations": '缩短或移除应用中的动画效果',
    'Monday - Friday, 5:00 AM - 7:00 PM': '周一至周五，早上5:00 - 晚上7:00',
    '*Must present a valid student, faculty, or staff ID.': '*须出示有效的学生、教职工证件。',
    '*S&D Punch Passes are only available to clients who have been issued either a S-Pass or D-Pass card.':
      '*S&D 次卡仅面向持有 S-Pass 或 D-Pass 卡的客户。',
    'Monday – Friday, 5:00 AM – 7:00 PM': '周一至周五，早上5:00 - 晚上7:00',
    'MORE SERVICES': '更多服务',
    'For info about Senior/Disabled & Medicare passes, ADA Paratransit, and Demand & Response service, visit':
      '有关老年人/残障人士及 Medicare 通行证、ADA 无障碍专车和按需响应服务的信息，请访问',
    'or call': '或致电',
    'RIDING POLICY': '乘车政策',
    'CONTACT & QUESTIONS': '联系与咨询',
    'Calls BTD': '致电 BTD',
    'Trip planning & general info': '行程规划与一般信息',
    'Opens in your browser': '在浏览器中打开',
    'Website': '网站',
    'Social media': '社交媒体',
    "Shows this day's transit schedule changes": '显示当天的交通时刻表变更',
    'Dismiss': '关闭',
    'Sunday': '星期日',
    'Monday': '星期一',
    'Tuesday': '星期二',
    'Wednesday': '星期三',
    'Thursday': '星期四',
    'Friday': '星期五',
    'Saturday': '星期六',

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
    'Settings': 'सेटिंग्स',
    'Theme, Language, and Accessibility': 'थीम, भाषा और सुलभता',

    // ── Tour, Help Guide, and misc (new) ────────────────────────────────
    'of': 'में से',
    'Skip': 'छोड़ें',
    'Skip tour': 'टूर छोड़ें',
    'Finish': 'समाप्त करें',
    'Finish tour': 'टूर समाप्त करें',
    'Next': 'अगला',
    'Pick Your Routes': 'अपने रूट चुनें',
    'Tap here to choose which routes show live buses on the map.': 'मानचित्र पर कौन से रूट की लाइव बसें दिखें, यह चुनने के लिए यहां टैप करें।',
    'Pin the routes you ride most so they sort to the top of the selector.': 'जिन रूट पर आप सबसे ज्यादा सफर करते हैं उन्हें पिन करें ताकि वे चयनकर्ता में सबसे ऊपर दिखें।',
    'Turn on alerts for delays and reroutes on your routes.': 'अपने रूट पर देरी और मार्ग परिवर्तन की सूचनाएं चालू करें।',
    'Riding BTD?': 'BTD से यात्रा कर रहे हैं?',
    'Switch over to Brazos Transit District from here anytime - or set it as your default in the toggle right below.':
      'यहां से कभी भी Brazos Transit District पर स्विच करें - या नीचे दिए टॉगल में इसे डिफ़ॉल्ट सेट करें।',
    'New Here?': 'नए हैं यहां?',
    'The Help Guide covers stop types and tips for riding the bus.': 'सहायता गाइड में स्टॉप के प्रकार और बस यात्रा के सुझाव दिए गए हैं।',
    'Normal Stop': 'सामान्य स्टॉप',
    "Just a regular stop on the route. The driver will stop if a passenger requests the stop or if someone's waiting to board.":
      'रूट पर एक सामान्य स्टॉप। यदि कोई यात्री अनुरोध करे या कोई चढ़ने के लिए प्रतीक्षा कर रहा हो तो चालक रुकेगा।',
    'Timepoint': 'टाइमपॉइंट',
    "Similar to a regular stop, but if the driver is running early, they'll hold here until the scheduled leave time.":
      'सामान्य स्टॉप जैसा, लेकिन यदि चालक समय से पहले पहुंच जाए, तो वे निर्धारित प्रस्थान समय तक यहां रुकेंगे।',
    'Temporary Stop': 'अस्थायी स्टॉप',
    'Like a normal stop, but not permanent. Usually for construction or temporary route changes. Sometimes marked with an A-frame sign, but not always.':
      'सामान्य स्टॉप जैसा, पर स्थायी नहीं। आमतौर पर निर्माण कार्य या अस्थायी रूट बदलाव के लिए। कभी-कभी A-फ्रेम साइन से चिह्नित, पर हमेशा नहीं।',
    'STOP TYPES': 'स्टॉप के प्रकार',
    'HOW TO RIDE': 'कैसे यात्रा करें',
    'TIP': 'सुझाव',
    'Stop Request': 'स्टॉप अनुरोध',
    'Pull the cord or push the strip when you hear your stop being announced. Otherwise, the driver will keep driving and can only drop you off at the next stop.':
      'जब आपके स्टॉप की घोषणा सुनें तो कॉर्ड खींचें या पट्टी दबाएं। अन्यथा, चालक चलाता रहेगा और केवल अगले स्टॉप पर उतार पाएगा।',
    'Some routes share stops on the other side of the road. It might be faster or easier to wait for the bus to come back around to the adjacent stop.':
      'कुछ रूट सड़क के दूसरी ओर स्टॉप साझा करते हैं। बस के पास वाले स्टॉप पर वापस आने का इंतज़ार करना तेज़ या आसान हो सकता है।',
    'Not Every Stop Is Automatic': 'हर स्टॉप पर अपने आप रुकाव नहीं होता',
    "If no one's waiting at the stop, the bus isn't stopping.\n\nDrivers aren't required to stop at any stop unless they're running ahead of schedule (at a timepoint), have passengers to pick up, or you requested it.":
      'यदि स्टॉप पर कोई प्रतीक्षा नहीं कर रहा, तो बस नहीं रुकेगी।\n\nचालक किसी भी स्टॉप पर रुकने के लिए बाध्य नहीं हैं जब तक कि वे समय से पहले न चल रहे हों (टाइमपॉइंट पर), यात्री चढ़ाने हों, या आपने अनुरोध किया हो।',
    'Plan Ahead': 'पहले से योजना बनाएं',
    'Leave earlier than you think you need to, especially during the beginning of the semester or peak riding times.\n\nNobody knows exactly how timing will be affected by traffic, ridership, accidents, etc.':
      'जितना आवश्यक लगे उससे पहले निकलें, खासकर सेमेस्टर की शुरुआत या व्यस्त समय में।\n\nकोई नहीं जानता कि ट्रैफ़िक, सवारियों की संख्या, दुर्घटनाओं आदि से समय कैसे प्रभावित होगा।',
    'Full Bus / "Another Bus Follows"': 'बस भरी हुई / "अगली बस आ रही है"',
    'Backpacks off, move back, make two rows. The busses can fit about 70 people. If a bus has to leave you behind, there\'s always another one behind it.\n\n"Another Bus Follows" on the marquee means the bus is full and will only stop to let people off. You will have to catch the next one.':
      'बैग उतारें, पीछे जाएं, दो पंक्तियां बनाएं। बस में लगभग 70 लोग समा सकते हैं। यदि बस को आपको छोड़ना पड़े, तो हमेशा एक और बस पीछे आ रही होती है।\n\nडिस्प्ले पर "अगली बस आ रही है" का मतलब है कि बस भरी हुई है और केवल लोगों को उतारने के लिए रुकेगी। आपको अगली बस पकड़नी होगी।',
    'Rush Hours': 'व्यस्त समय',
    'Expect busses to be running late or full during rush hours: 7-8 AM, class changes, 3 PM, and 5 PM.':
      'व्यस्त समय में बसों के देरी से चलने या भरी होने की उम्मीद रखें: सुबह 7-8 बजे, क्लास बदलाव का समय, दोपहर 3 बजे और शाम 5 बजे।',
    'Mobility Devices & Bikes': 'गतिशीलता उपकरण और साइकिलें',
    "Scooters, one-wheels, and similar devices need to be folded and stowed under a seat. Bikes are not allowed on buses.\n\nIf you can't take it on the bus, park it or ride it. These items are trip hazards and become projectiles in accidents. Please be courteous to everyone else.":
      'स्कूटर, वन-व्हील और इसी तरह के उपकरणों को मोड़कर सीट के नीचे रखना होगा। बसों में साइकिलों की अनुमति नहीं है।\n\nयदि आप इसे बस में नहीं ले जा सकते, तो इसे पार्क करें या चलाकर जाएं। ये वस्तुएं गिरने का खतरा हैं और दुर्घटना में प्रक्षेप्य बन सकती हैं। कृपया सभी के प्रति विनम्र रहें।',
    'Uses a stronger-contrast color palette throughout the app': 'पूरे ऐप में अधिक तेज़ कंट्रास्ट वाला रंग पैलेट उपयोग करता है',
    "Shortens or removes the app's animations": 'ऐप के एनिमेशन को छोटा या हटा देता है',
    'Monday - Friday, 5:00 AM - 7:00 PM': 'सोमवार - शुक्रवार, सुबह 5:00 - शाम 7:00',
    '*Must present a valid student, faculty, or staff ID.': '*वैध छात्र, संकाय या स्टाफ आईडी प्रस्तुत करना आवश्यक है।',
    '*S&D Punch Passes are only available to clients who have been issued either a S-Pass or D-Pass card.':
      '*S&D पंच पास केवल उन ग्राहकों के लिए उपलब्ध है जिन्हें S-Pass या D-Pass कार्ड जारी किया गया है।',
    'Monday – Friday, 5:00 AM – 7:00 PM': 'सोमवार - शुक्रवार, सुबह 5:00 - शाम 7:00',
    'MORE SERVICES': 'अधिक सेवाएं',
    'For info about Senior/Disabled & Medicare passes, ADA Paratransit, and Demand & Response service, visit':
      'सीनियर/दिव्यांग और Medicare पास, ADA पैराट्रांज़िट, और डिमांड एंड रिस्पॉन्स सेवा की जानकारी के लिए विज़िट करें',
    'or call': 'या कॉल करें',
    'RIDING POLICY': 'यात्रा नीति',
    'CONTACT & QUESTIONS': 'संपर्क और प्रश्न',
    'Calls BTD': 'BTD को कॉल करता है',
    'Trip planning & general info': 'यात्रा योजना और सामान्य जानकारी',
    'Opens in your browser': 'आपके ब्राउज़र में खुलता है',
    'Website': 'वेबसाइट',
    'Social media': 'सोशल मीडिया',
    "Shows this day's transit schedule changes": 'इस दिन के परिवहन शेड्यूल में बदलाव दिखाता है',
    'Dismiss': 'बंद करें',
    'Sunday': 'रविवार',
    'Monday': 'सोमवार',
    'Tuesday': 'मंगलवार',
    'Wednesday': 'बुधवार',
    'Thursday': 'गुरुवार',
    'Friday': 'शुक्रवार',
    'Saturday': 'शनिवार',

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
    'Settings': 'Cài đặt',
    'Theme, Language, and Accessibility': 'Giao diện, Ngôn ngữ và Trợ năng',

    // ── Tour, Help Guide, and misc (new) ────────────────────────────────
    'of': 'trong',
    'Skip': 'Bỏ qua',
    'Skip tour': 'Bỏ qua hướng dẫn',
    'Finish': 'Hoàn tất',
    'Finish tour': 'Hoàn tất hướng dẫn',
    'Next': 'Tiếp theo',
    'Pick Your Routes': 'Chọn tuyến của bạn',
    'Tap here to choose which routes show live buses on the map.': 'Chạm vào đây để chọn tuyến nào hiển thị xe buýt trực tiếp trên bản đồ.',
    'Pin the routes you ride most so they sort to the top of the selector.': 'Ghim các tuyến bạn đi nhiều nhất để chúng hiện lên đầu bộ chọn.',
    'Turn on alerts for delays and reroutes on your routes.': 'Bật thông báo về trễ giờ và đổi tuyến cho các tuyến của bạn.',
    'Riding BTD?': 'Đi xe BTD?',
    'Switch over to Brazos Transit District from here anytime - or set it as your default in the toggle right below.':
      'Chuyển sang Brazos Transit District bất cứ lúc nào từ đây - hoặc đặt làm mặc định bằng công tắc bên dưới.',
    'New Here?': 'Mới sử dụng?',
    'The Help Guide covers stop types and tips for riding the bus.': 'Hướng dẫn trợ giúp bao gồm các loại trạm dừng và mẹo đi xe buýt.',
    'Normal Stop': 'Trạm thường',
    "Just a regular stop on the route. The driver will stop if a passenger requests the stop or if someone's waiting to board.":
      'Chỉ là một trạm dừng bình thường trên tuyến. Tài xế sẽ dừng nếu hành khách yêu cầu hoặc có người đang chờ lên xe.',
    'Timepoint': 'Điểm mốc thời gian',
    "Similar to a regular stop, but if the driver is running early, they'll hold here until the scheduled leave time.":
      'Tương tự trạm thường, nhưng nếu tài xế đến sớm, họ sẽ dừng lại đây đến giờ khởi hành theo lịch.',
    'Temporary Stop': 'Trạm tạm thời',
    'Like a normal stop, but not permanent. Usually for construction or temporary route changes. Sometimes marked with an A-frame sign, but not always.':
      'Giống trạm thường nhưng không cố định. Thường dùng cho công trình xây dựng hoặc thay đổi tuyến tạm thời. Đôi khi có biển hình chữ A đánh dấu, nhưng không phải lúc nào cũng vậy.',
    'STOP TYPES': 'LOẠI TRẠM DỪNG',
    'HOW TO RIDE': 'CÁCH ĐI XE',
    'TIP': 'MẸO',
    'Stop Request': 'Yêu cầu dừng',
    'Pull the cord or push the strip when you hear your stop being announced. Otherwise, the driver will keep driving and can only drop you off at the next stop.':
      'Kéo dây hoặc nhấn dải khi nghe thông báo trạm của bạn. Nếu không, tài xế sẽ tiếp tục chạy và chỉ có thể cho bạn xuống ở trạm tiếp theo.',
    'Some routes share stops on the other side of the road. It might be faster or easier to wait for the bus to come back around to the adjacent stop.':
      'Một số tuyến dùng chung trạm ở phía bên kia đường. Có thể nhanh hơn hoặc dễ hơn nếu chờ xe buýt quay lại trạm liền kề.',
    'Not Every Stop Is Automatic': 'Không phải trạm nào cũng tự động dừng',
    "If no one's waiting at the stop, the bus isn't stopping.\n\nDrivers aren't required to stop at any stop unless they're running ahead of schedule (at a timepoint), have passengers to pick up, or you requested it.":
      'Nếu không có ai chờ ở trạm, xe buýt sẽ không dừng.\n\nTài xế không bắt buộc phải dừng ở bất kỳ trạm nào trừ khi họ chạy sớm hơn lịch (tại điểm mốc thời gian), có hành khách cần đón, hoặc bạn đã yêu cầu.',
    'Plan Ahead': 'Lên kế hoạch trước',
    'Leave earlier than you think you need to, especially during the beginning of the semester or peak riding times.\n\nNobody knows exactly how timing will be affected by traffic, ridership, accidents, etc.':
      'Hãy xuất phát sớm hơn bạn nghĩ là cần thiết, đặc biệt vào đầu học kỳ hoặc giờ cao điểm.\n\nKhông ai biết chính xác thời gian sẽ bị ảnh hưởng thế nào bởi giao thông, số lượng hành khách, tai nạn, v.v.',
    'Full Bus / "Another Bus Follows"': 'Xe đầy / "Còn xe khác phía sau"',
    'Backpacks off, move back, make two rows. The busses can fit about 70 people. If a bus has to leave you behind, there\'s always another one behind it.\n\n"Another Bus Follows" on the marquee means the bus is full and will only stop to let people off. You will have to catch the next one.':
      'Tháo ba lô, di chuyển ra sau, xếp thành hai hàng. Xe buýt chứa được khoảng 70 người. Nếu một xe phải bỏ lại bạn, luôn có xe khác phía sau.\n\n"Còn xe khác phía sau" trên bảng hiệu có nghĩa là xe đã đầy và chỉ dừng để cho khách xuống. Bạn sẽ phải bắt chuyến tiếp theo.',
    'Rush Hours': 'Giờ cao điểm',
    'Expect busses to be running late or full during rush hours: 7-8 AM, class changes, 3 PM, and 5 PM.':
      'Xe buýt có thể trễ giờ hoặc đầy khách vào giờ cao điểm: 7-8 giờ sáng, giờ đổi tiết học, 3 giờ chiều và 5 giờ chiều.',
    'Mobility Devices & Bikes': 'Thiết bị hỗ trợ di chuyển & Xe đạp',
    "Scooters, one-wheels, and similar devices need to be folded and stowed under a seat. Bikes are not allowed on buses.\n\nIf you can't take it on the bus, park it or ride it. These items are trip hazards and become projectiles in accidents. Please be courteous to everyone else.":
      'Xe scooter, xe một bánh và các thiết bị tương tự cần được gấp lại và cất dưới ghế. Không được mang xe đạp lên xe buýt.\n\nNếu không thể mang lên xe, hãy để lại hoặc đi bằng thiết bị đó. Những vật dụng này gây nguy cơ vấp ngã và có thể trở thành vật văng trong tai nạn. Vui lòng lịch sự với mọi người xung quanh.',
    'Uses a stronger-contrast color palette throughout the app': 'Sử dụng bảng màu tương phản mạnh hơn trong toàn bộ ứng dụng',
    "Shortens or removes the app's animations": 'Rút ngắn hoặc loại bỏ hiệu ứng chuyển động của ứng dụng',
    'Monday - Friday, 5:00 AM - 7:00 PM': 'Thứ Hai - Thứ Sáu, 5:00 sáng - 7:00 tối',
    '*Must present a valid student, faculty, or staff ID.': '*Phải xuất trình thẻ sinh viên, giảng viên hoặc nhân viên hợp lệ.',
    '*S&D Punch Passes are only available to clients who have been issued either a S-Pass or D-Pass card.':
      '*Vé S&D Punch chỉ dành cho khách hàng đã được cấp thẻ S-Pass hoặc D-Pass.',
    'Monday – Friday, 5:00 AM – 7:00 PM': 'Thứ Hai - Thứ Sáu, 5:00 sáng - 7:00 tối',
    'MORE SERVICES': 'DỊCH VỤ KHÁC',
    'For info about Senior/Disabled & Medicare passes, ADA Paratransit, and Demand & Response service, visit':
      'Để biết thông tin về vé cho người cao tuổi/khuyết tật & Medicare, ADA Paratransit, và dịch vụ theo yêu cầu, hãy truy cập',
    'or call': 'hoặc gọi',
    'RIDING POLICY': 'QUY ĐỊNH ĐI XE',
    'CONTACT & QUESTIONS': 'LIÊN HỆ & CÂU HỎI',
    'Calls BTD': 'Gọi cho BTD',
    'Trip planning & general info': 'Lên kế hoạch chuyến đi & thông tin chung',
    'Opens in your browser': 'Mở trong trình duyệt của bạn',
    'Website': 'Trang web',
    'Social media': 'Mạng xã hội',
    "Shows this day's transit schedule changes": 'Hiển thị các thay đổi lịch trình giao thông của ngày này',
    'Dismiss': 'Đóng',
    'Sunday': 'Chủ Nhật',
    'Monday': 'Thứ Hai',
    'Tuesday': 'Thứ Ba',
    'Wednesday': 'Thứ Tư',
    'Thursday': 'Thứ Năm',
    'Friday': 'Thứ Sáu',
    'Saturday': 'Thứ Bảy',

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
    'Settings': '설정',
    'Theme, Language, and Accessibility': '테마, 언어 및 접근성',

    // ── Tour, Help Guide, and misc (new) ────────────────────────────────
    'of': '/',
    'Skip': '건너뛰기',
    'Skip tour': '투어 건너뛰기',
    'Finish': '완료',
    'Finish tour': '투어 완료',
    'Next': '다음',
    'Pick Your Routes': '노선 선택하기',
    'Tap here to choose which routes show live buses on the map.': '지도에 실시간 버스를 표시할 노선을 선택하려면 여기를 탭하세요.',
    'Pin the routes you ride most so they sort to the top of the selector.': '자주 이용하는 노선을 고정하면 선택기 맨 위에 표시됩니다.',
    'Turn on alerts for delays and reroutes on your routes.': '내 노선의 지연 및 우회 알림을 켜세요.',
    'Riding BTD?': 'BTD를 이용하시나요?',
    'Switch over to Brazos Transit District from here anytime - or set it as your default in the toggle right below.':
      '언제든지 여기에서 Brazos Transit District로 전환할 수 있습니다 - 또는 아래 토글에서 기본값으로 설정하세요.',
    'New Here?': '처음이신가요?',
    'The Help Guide covers stop types and tips for riding the bus.': '도움말 가이드에서 정류장 유형과 버스 이용 팁을 확인하세요.',
    'Normal Stop': '일반 정류장',
    "Just a regular stop on the route. The driver will stop if a passenger requests the stop or if someone's waiting to board.":
      '노선의 일반 정류장입니다. 승객이 하차를 요청하거나 누군가 탑승을 기다리고 있으면 기사가 정차합니다.',
    'Timepoint': '기준 정류장',
    "Similar to a regular stop, but if the driver is running early, they'll hold here until the scheduled leave time.":
      '일반 정류장과 비슷하지만, 기사가 예정보다 일찍 도착하면 예정된 출발 시간까지 이곳에서 대기합니다.',
    'Temporary Stop': '임시 정류장',
    'Like a normal stop, but not permanent. Usually for construction or temporary route changes. Sometimes marked with an A-frame sign, but not always.':
      '일반 정류장과 비슷하지만 영구적이지 않습니다. 보통 공사나 임시 노선 변경 시 사용됩니다. A자형 표지판으로 표시되는 경우도 있지만 항상 그런 것은 아닙니다.',
    'STOP TYPES': '정류장 유형',
    'HOW TO RIDE': '이용 방법',
    'TIP': '팁',
    'Stop Request': '하차 요청',
    'Pull the cord or push the strip when you hear your stop being announced. Otherwise, the driver will keep driving and can only drop you off at the next stop.':
      '정류장 안내 방송이 나오면 줄을 당기거나 벨을 누르세요. 그렇지 않으면 기사가 계속 운행하며 다음 정류장에서만 내려줄 수 있습니다.',
    'Some routes share stops on the other side of the road. It might be faster or easier to wait for the bus to come back around to the adjacent stop.':
      '일부 노선은 도로 반대편 정류장을 공유합니다. 버스가 인접 정류장으로 돌아올 때까지 기다리는 것이 더 빠르거나 편할 수 있습니다.',
    'Not Every Stop Is Automatic': '모든 정류장에서 자동으로 정차하지 않습니다',
    "If no one's waiting at the stop, the bus isn't stopping.\n\nDrivers aren't required to stop at any stop unless they're running ahead of schedule (at a timepoint), have passengers to pick up, or you requested it.":
      '정류장에서 기다리는 사람이 없으면 버스는 정차하지 않습니다.\n\n기사는 일정보다 일찍 운행 중이거나(기준 정류장에서), 태울 승객이 있거나, 요청이 있는 경우가 아니면 정류장에 정차할 의무가 없습니다.',
    'Plan Ahead': '미리 계획하기',
    'Leave earlier than you think you need to, especially during the beginning of the semester or peak riding times.\n\nNobody knows exactly how timing will be affected by traffic, ridership, accidents, etc.':
      '특히 학기 초나 혼잡 시간대에는 생각보다 일찍 출발하세요.\n\n교통 상황, 이용객 수, 사고 등에 따라 시간이 얼마나 영향을 받을지는 아무도 정확히 알 수 없습니다.',
    'Full Bus / "Another Bus Follows"': '만차 / "다음 버스 있음"',
    'Backpacks off, move back, make two rows. The busses can fit about 70 people. If a bus has to leave you behind, there\'s always another one behind it.\n\n"Another Bus Follows" on the marquee means the bus is full and will only stop to let people off. You will have to catch the next one.':
      '배낭을 벗고 뒤로 이동하여 두 줄로 서세요. 버스는 약 70명이 탑승할 수 있습니다. 버스가 당신을 태우지 못하더라도 뒤따라오는 버스가 항상 있습니다.\n\n전광판의 "다음 버스 있음"은 버스가 만차이며 하차만을 위해 정차한다는 의미입니다. 다음 버스를 타야 합니다.',
    'Rush Hours': '혼잡 시간대',
    'Expect busses to be running late or full during rush hours: 7-8 AM, class changes, 3 PM, and 5 PM.':
      '혼잡 시간대(오전 7-8시, 수업 교체 시간, 오후 3시, 오후 5시)에는 버스가 지연되거나 만차일 수 있습니다.',
    'Mobility Devices & Bikes': '이동 보조기구 및 자전거',
    "Scooters, one-wheels, and similar devices need to be folded and stowed under a seat. Bikes are not allowed on buses.\n\nIf you can't take it on the bus, park it or ride it. These items are trip hazards and become projectiles in accidents. Please be courteous to everyone else.":
      '스쿠터, 외발 전동기기 등 유사 기기는 접어서 좌석 아래에 보관해야 합니다. 자전거는 버스에 탑승할 수 없습니다.\n\n버스에 가지고 탈 수 없다면 주차하거나 타고 가세요. 이러한 물품은 걸려 넘어질 위험이 있으며 사고 시 흉기가 될 수 있습니다. 다른 승객을 배려해 주세요.',
    'Uses a stronger-contrast color palette throughout the app': '앱 전체에 더 강한 대비의 색상 팔레트를 사용합니다',
    "Shortens or removes the app's animations": '앱의 애니메이션을 줄이거나 제거합니다',
    'Monday - Friday, 5:00 AM - 7:00 PM': '월요일 - 금요일, 오전 5:00 - 오후 7:00',
    '*Must present a valid student, faculty, or staff ID.': '*유효한 학생, 교직원 신분증을 제시해야 합니다.',
    '*S&D Punch Passes are only available to clients who have been issued either a S-Pass or D-Pass card.':
      '*S&D 펀치 패스는 S-Pass 또는 D-Pass 카드를 발급받은 고객만 이용할 수 있습니다.',
    'Monday – Friday, 5:00 AM – 7:00 PM': '월요일 - 금요일, 오전 5:00 - 오후 7:00',
    'MORE SERVICES': '추가 서비스',
    'For info about Senior/Disabled & Medicare passes, ADA Paratransit, and Demand & Response service, visit':
      '노인/장애인 및 Medicare 패스, ADA 파라트랜짓, 수요응답형 서비스에 대한 정보는 다음을 방문하세요',
    'or call': '또는 전화하세요',
    'RIDING POLICY': '이용 정책',
    'CONTACT & QUESTIONS': '문의 및 연락처',
    'Calls BTD': 'BTD에 전화 걸기',
    'Trip planning & general info': '여행 계획 및 일반 정보',
    'Opens in your browser': '브라우저에서 열기',
    'Website': '웹사이트',
    'Social media': '소셜 미디어',
    "Shows this day's transit schedule changes": '이 날짜의 교통 일정 변경 사항을 표시합니다',
    'Dismiss': '닫기',
    'Sunday': '일요일',
    'Monday': '월요일',
    'Tuesday': '화요일',
    'Wednesday': '수요일',
    'Thursday': '목요일',
    'Friday': '금요일',
    'Saturday': '토요일',

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
    'Settings': 'الإعدادات',
    'Theme, Language, and Accessibility': 'المظهر واللغة وإمكانية الوصول',

    // ── Tour, Help Guide, and misc (new) ────────────────────────────────
    'of': 'من',
    'Skip': 'تخطي',
    'Skip tour': 'تخطي الجولة',
    'Finish': 'إنهاء',
    'Finish tour': 'إنهاء الجولة',
    'Next': 'التالي',
    'Pick Your Routes': 'اختر خطوطك',
    'Tap here to choose which routes show live buses on the map.': 'اضغط هنا لاختيار الخطوط التي تظهر حافلاتها المباشرة على الخريطة.',
    'Pin the routes you ride most so they sort to the top of the selector.': 'ثبّت الخطوط التي تستقلها كثيرًا لتظهر أولًا في أداة الاختيار.',
    'Turn on alerts for delays and reroutes on your routes.': 'فعّل تنبيهات التأخير وتغيير المسار لخطوطك.',
    'Riding BTD?': 'هل تستقل BTD؟',
    'Switch over to Brazos Transit District from here anytime - or set it as your default in the toggle right below.':
      'يمكنك التبديل إلى Brazos Transit District من هنا في أي وقت - أو جعله الافتراضي عبر المفتاح أدناه.',
    'New Here?': 'جديد هنا؟',
    'The Help Guide covers stop types and tips for riding the bus.': 'يغطي دليل المساعدة أنواع المحطات ونصائح ركوب الحافلة.',
    'Normal Stop': 'محطة عادية',
    "Just a regular stop on the route. The driver will stop if a passenger requests the stop or if someone's waiting to board.":
      'مجرد محطة عادية على المسار. سيتوقف السائق إذا طلب أحد الركاب التوقف أو كان أحدهم ينتظر الصعود.',
    'Timepoint': 'نقطة توقيت',
    "Similar to a regular stop, but if the driver is running early, they'll hold here until the scheduled leave time.":
      'مشابهة للمحطة العادية، لكن إذا وصل السائق مبكرًا، سينتظر هنا حتى موعد المغادرة المحدد.',
    'Temporary Stop': 'محطة مؤقتة',
    'Like a normal stop, but not permanent. Usually for construction or temporary route changes. Sometimes marked with an A-frame sign, but not always.':
      'مثل المحطة العادية لكنها غير دائمة. عادة بسبب أعمال إنشاء أو تغييرات مؤقتة في المسار. تُميّز أحيانًا بلافتة على شكل حرف A، لكن ليس دائمًا.',
    'STOP TYPES': 'أنواع المحطات',
    'HOW TO RIDE': 'كيفية الركوب',
    'TIP': 'نصيحة',
    'Stop Request': 'طلب التوقف',
    'Pull the cord or push the strip when you hear your stop being announced. Otherwise, the driver will keep driving and can only drop you off at the next stop.':
      'اسحب الحبل أو اضغط الشريط عند سماع الإعلان عن محطتك. وإلا، سيستمر السائق في القيادة ولن يتمكن من إنزالك إلا في المحطة التالية.',
    'Some routes share stops on the other side of the road. It might be faster or easier to wait for the bus to come back around to the adjacent stop.':
      'تشترك بعض الخطوط في محطات على الجانب الآخر من الطريق. قد يكون انتظار عودة الحافلة إلى المحطة المجاورة أسرع أو أسهل.',
    'Not Every Stop Is Automatic': 'ليست كل محطة تلقائية',
    "If no one's waiting at the stop, the bus isn't stopping.\n\nDrivers aren't required to stop at any stop unless they're running ahead of schedule (at a timepoint), have passengers to pick up, or you requested it.":
      'إذا لم ينتظر أحد عند المحطة، فلن تتوقف الحافلة.\n\nالسائقون غير ملزمين بالتوقف عند أي محطة إلا إذا كانوا متقدمين عن الجدول (عند نقطة توقيت)، أو لديهم ركاب لاصطحابهم، أو طلبت ذلك.',
    'Plan Ahead': 'خطط مسبقًا',
    'Leave earlier than you think you need to, especially during the beginning of the semester or peak riding times.\n\nNobody knows exactly how timing will be affected by traffic, ridership, accidents, etc.':
      'غادر أبكر مما تعتقد أنك تحتاج، خاصة في بداية الفصل الدراسي أو أوقات الذروة.\n\nلا أحد يعرف بالضبط كيف سيتأثر التوقيت بالازدحام المروري، عدد الركاب، الحوادث، وغيرها.',
    'Full Bus / "Another Bus Follows"': 'حافلة ممتلئة / "حافلة أخرى تتبع"',
    'Backpacks off, move back, make two rows. The busses can fit about 70 people. If a bus has to leave you behind, there\'s always another one behind it.\n\n"Another Bus Follows" on the marquee means the bus is full and will only stop to let people off. You will have to catch the next one.':
      'انزع حقيبة الظهر، تحرك للخلف، شكّل صفين. تتسع الحافلة لنحو 70 شخصًا. إذا اضطرت الحافلة لتركك، فهناك دائمًا حافلة أخرى خلفها.\n\nعبارة "حافلة أخرى تتبع" على اللوحة تعني أن الحافلة ممتلئة وستتوقف فقط لإنزال الركاب. سيتعين عليك ركوب الحافلة التالية.',
    'Rush Hours': 'ساعات الذروة',
    'Expect busses to be running late or full during rush hours: 7-8 AM, class changes, 3 PM, and 5 PM.':
      'توقع تأخر الحافلات أو امتلائها خلال ساعات الذروة: 7-8 صباحًا، أوقات تبديل الحصص، 3 عصرًا، و5 مساءً.',
    'Mobility Devices & Bikes': 'أجهزة التنقل والدراجات',
    "Scooters, one-wheels, and similar devices need to be folded and stowed under a seat. Bikes are not allowed on buses.\n\nIf you can't take it on the bus, park it or ride it. These items are trip hazards and become projectiles in accidents. Please be courteous to everyone else.":
      'يجب طي السكوترات والعجلات الأحادية والأجهزة المماثلة وتخزينها تحت المقعد. الدراجات غير مسموح بها في الحافلات.\n\nإذا تعذر أخذها في الحافلة، اركنها أو استخدمها للوصول. هذه الأغراض تشكل خطر تعثر وقد تتحول إلى أجسام طائرة في الحوادث. يرجى مراعاة الركاب الآخرين.',
    'Uses a stronger-contrast color palette throughout the app': 'يستخدم لوحة ألوان بتباين أقوى في جميع أنحاء التطبيق',
    "Shortens or removes the app's animations": 'يقصّر أو يزيل الرسوم المتحركة في التطبيق',
    'Monday - Friday, 5:00 AM - 7:00 PM': 'الاثنين - الجمعة، 5:00 صباحًا - 7:00 مساءً',
    '*Must present a valid student, faculty, or staff ID.': '*يجب تقديم بطاقة هوية طالب أو هيئة تدريس أو موظف سارية المفعول.',
    '*S&D Punch Passes are only available to clients who have been issued either a S-Pass or D-Pass card.':
      '*بطاقات S&D Punch متاحة فقط للعملاء الحاصلين على بطاقة S-Pass أو D-Pass.',
    'Monday – Friday, 5:00 AM – 7:00 PM': 'الاثنين - الجمعة، 5:00 صباحًا - 7:00 مساءً',
    'MORE SERVICES': 'خدمات إضافية',
    'For info about Senior/Disabled & Medicare passes, ADA Paratransit, and Demand & Response service, visit':
      'لمعلومات حول تصاريح كبار السن/ذوي الإعاقة و Medicare، وخدمة ADA Paratransit، وخدمة الطلب والاستجابة، تفضل بزيارة',
    'or call': 'أو اتصل على',
    'RIDING POLICY': 'سياسة الركوب',
    'CONTACT & QUESTIONS': 'التواصل والأسئلة',
    'Calls BTD': 'يتصل بـ BTD',
    'Trip planning & general info': 'تخطيط الرحلات والمعلومات العامة',
    'Opens in your browser': 'يفتح في متصفحك',
    'Website': 'الموقع الإلكتروني',
    'Social media': 'وسائل التواصل الاجتماعي',
    "Shows this day's transit schedule changes": 'يعرض تغييرات جدول النقل لهذا اليوم',
    'Dismiss': 'إغلاق',
    'Sunday': 'الأحد',
    'Monday': 'الاثنين',
    'Tuesday': 'الثلاثاء',
    'Wednesday': 'الأربعاء',
    'Thursday': 'الخميس',
    'Friday': 'الجمعة',
    'Saturday': 'السبت',

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
    'Settings': 'Paramètres',
    'Theme, Language, and Accessibility': 'Thème, langue et accessibilité',

    // ── Tour, Help Guide, and misc (new) ────────────────────────────────
    'of': 'sur',
    'Skip': 'Ignorer',
    'Skip tour': 'Ignorer la visite',
    'Finish': 'Terminer',
    'Finish tour': 'Terminer la visite',
    'Next': 'Suivant',
    'Pick Your Routes': 'Choisissez vos lignes',
    'Tap here to choose which routes show live buses on the map.': 'Appuyez ici pour choisir quelles lignes affichent des bus en direct sur la carte.',
    'Pin the routes you ride most so they sort to the top of the selector.': 'Épinglez les lignes que vous empruntez le plus pour qu\'elles apparaissent en haut du sélecteur.',
    'Turn on alerts for delays and reroutes on your routes.': 'Activez les alertes de retards et de déviations pour vos lignes.',
    'Riding BTD?': 'Vous prenez BTD ?',
    'Switch over to Brazos Transit District from here anytime - or set it as your default in the toggle right below.':
      'Passez à Brazos Transit District à tout moment depuis ici - ou définissez-le par défaut avec l\'interrupteur ci-dessous.',
    'New Here?': 'Nouveau ici ?',
    'The Help Guide covers stop types and tips for riding the bus.': 'Le guide d\'aide couvre les types d\'arrêts et des conseils pour prendre le bus.',
    'Normal Stop': 'Arrêt normal',
    "Just a regular stop on the route. The driver will stop if a passenger requests the stop or if someone's waiting to board.":
      'Un arrêt ordinaire sur la ligne. Le conducteur s\'arrêtera si un passager le demande ou si quelqu\'un attend pour monter.',
    'Timepoint': 'Point de contrôle',
    "Similar to a regular stop, but if the driver is running early, they'll hold here until the scheduled leave time.":
      'Similaire à un arrêt normal, mais si le conducteur est en avance, il patientera ici jusqu\'à l\'heure de départ prévue.',
    'Temporary Stop': 'Arrêt temporaire',
    'Like a normal stop, but not permanent. Usually for construction or temporary route changes. Sometimes marked with an A-frame sign, but not always.':
      'Comme un arrêt normal, mais non permanent. Généralement pour des travaux ou des changements temporaires de ligne. Parfois signalé par un panneau chevalet, mais pas toujours.',
    'STOP TYPES': 'TYPES D\'ARRÊTS',
    'HOW TO RIDE': 'COMMENT VOYAGER',
    'TIP': 'ASTUCE',
    'Stop Request': 'Demande d\'arrêt',
    'Pull the cord or push the strip when you hear your stop being announced. Otherwise, the driver will keep driving and can only drop you off at the next stop.':
      'Tirez le cordon ou appuyez sur la bande lorsque vous entendez annoncer votre arrêt. Sinon, le conducteur continuera et ne pourra vous déposer qu\'au prochain arrêt.',
    'Some routes share stops on the other side of the road. It might be faster or easier to wait for the bus to come back around to the adjacent stop.':
      'Certaines lignes partagent des arrêts de l\'autre côté de la route. Il peut être plus rapide ou plus simple d\'attendre que le bus revienne à l\'arrêt adjacent.',
    'Not Every Stop Is Automatic': 'Tous les arrêts ne sont pas automatiques',
    "If no one's waiting at the stop, the bus isn't stopping.\n\nDrivers aren't required to stop at any stop unless they're running ahead of schedule (at a timepoint), have passengers to pick up, or you requested it.":
      'Si personne n\'attend à l\'arrêt, le bus ne s\'arrête pas.\n\nLes conducteurs ne sont pas tenus de s\'arrêter à un arrêt sauf s\'ils sont en avance sur l\'horaire (à un point de contrôle), ont des passagers à prendre, ou si vous l\'avez demandé.',
    'Plan Ahead': 'Planifiez à l\'avance',
    'Leave earlier than you think you need to, especially during the beginning of the semester or peak riding times.\n\nNobody knows exactly how timing will be affected by traffic, ridership, accidents, etc.':
      'Partez plus tôt que vous ne le pensez nécessaire, surtout en début de semestre ou aux heures de pointe.\n\nPersonne ne sait exactement comment le trafic, l\'affluence, les accidents, etc. affecteront les horaires.',
    'Full Bus / "Another Bus Follows"': 'Bus complet / "Un autre bus suit"',
    'Backpacks off, move back, make two rows. The busses can fit about 70 people. If a bus has to leave you behind, there\'s always another one behind it.\n\n"Another Bus Follows" on the marquee means the bus is full and will only stop to let people off. You will have to catch the next one.':
      'Enlevez votre sac à dos, reculez, formez deux rangées. Les bus peuvent accueillir environ 70 personnes. Si un bus doit vous laisser derrière, il y en a toujours un autre juste après.\n\n"Un autre bus suit" sur le panneau signifie que le bus est complet et ne s\'arrêtera que pour laisser descendre les passagers. Vous devrez prendre le suivant.',
    'Rush Hours': 'Heures de pointe',
    'Expect busses to be running late or full during rush hours: 7-8 AM, class changes, 3 PM, and 5 PM.':
      'Attendez-vous à des bus en retard ou complets aux heures de pointe : 7h-8h, changements de cours, 15h et 17h.',
    'Mobility Devices & Bikes': 'Aides à la mobilité et vélos',
    "Scooters, one-wheels, and similar devices need to be folded and stowed under a seat. Bikes are not allowed on buses.\n\nIf you can't take it on the bus, park it or ride it. These items are trip hazards and become projectiles in accidents. Please be courteous to everyone else.":
      'Les trottinettes, monoroues et appareils similaires doivent être pliés et rangés sous un siège. Les vélos ne sont pas autorisés dans les bus.\n\nSi vous ne pouvez pas l\'emporter dans le bus, garez-le ou roulez avec. Ces objets présentent un risque de chute et peuvent devenir des projectiles en cas d\'accident. Merci d\'être courtois envers les autres.',
    'Uses a stronger-contrast color palette throughout the app': 'Utilise une palette de couleurs à contraste plus fort dans toute l\'application',
    "Shortens or removes the app's animations": 'Raccourcit ou supprime les animations de l\'application',
    'Monday - Friday, 5:00 AM - 7:00 PM': 'Lundi - Vendredi, 5h00 - 19h00',
    '*Must present a valid student, faculty, or staff ID.': '*Une carte d\'étudiant, de professeur ou de personnel valide doit être présentée.',
    '*S&D Punch Passes are only available to clients who have been issued either a S-Pass or D-Pass card.':
      '*Les cartes S&D Punch sont réservées aux clients ayant reçu une carte S-Pass ou D-Pass.',
    'Monday – Friday, 5:00 AM – 7:00 PM': 'Lundi - Vendredi, 5h00 - 19h00',
    'MORE SERVICES': 'AUTRES SERVICES',
    'For info about Senior/Disabled & Medicare passes, ADA Paratransit, and Demand & Response service, visit':
      'Pour des informations sur les cartes seniors/handicapés et Medicare, le service ADA Paratransit, et le service à la demande, visitez',
    'or call': 'ou appelez',
    'RIDING POLICY': 'RÈGLES DE VOYAGE',
    'CONTACT & QUESTIONS': 'CONTACT ET QUESTIONS',
    'Calls BTD': 'Appelle BTD',
    'Trip planning & general info': 'Planification de trajet et informations générales',
    'Opens in your browser': 'S\'ouvre dans votre navigateur',
    'Website': 'Site web',
    'Social media': 'Réseaux sociaux',
    "Shows this day's transit schedule changes": 'Affiche les changements d\'horaires de transport de ce jour',
    'Dismiss': 'Fermer',
    'Sunday': 'Dimanche',
    'Monday': 'Lundi',
    'Tuesday': 'Mardi',
    'Wednesday': 'Mercredi',
    'Thursday': 'Jeudi',
    'Friday': 'Vendredi',
    'Saturday': 'Samedi',

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
    'Settings': 'Mga Setting',
    'Theme, Language, and Accessibility': 'Tema, Wika, at Accessibility',

    // ── Tour, Help Guide, and misc (new) ────────────────────────────────
    'of': 'ng',
    'Skip': 'Laktawan',
    'Skip tour': 'Laktawan ang tour',
    'Finish': 'Tapusin',
    'Finish tour': 'Tapusin ang tour',
    'Next': 'Susunod',
    'Pick Your Routes': 'Piliin ang Iyong mga Ruta',
    'Tap here to choose which routes show live buses on the map.': 'Pindutin dito para piliin kung aling mga ruta ang magpapakita ng live na bus sa mapa.',
    'Pin the routes you ride most so they sort to the top of the selector.': 'I-pin ang mga rutang madalas mong sakyan para lumabas ang mga ito sa itaas ng selector.',
    'Turn on alerts for delays and reroutes on your routes.': 'I-on ang mga alerto para sa pagkaantala at pagbabago ng ruta sa iyong mga ruta.',
    'Riding BTD?': 'Sumasakay sa BTD?',
    'Switch over to Brazos Transit District from here anytime - or set it as your default in the toggle right below.':
      'Lumipat sa Brazos Transit District anumang oras mula dito - o gawin itong default sa toggle sa ibaba.',
    'New Here?': 'Bago Dito?',
    'The Help Guide covers stop types and tips for riding the bus.': 'Sinasaklaw ng Help Guide ang mga uri ng hintuan at mga tip sa pagsakay ng bus.',
    'Normal Stop': 'Regular na Hintuan',
    "Just a regular stop on the route. The driver will stop if a passenger requests the stop or if someone's waiting to board.":
      'Isang regular na hintuan lamang sa ruta. Hihinto ang driver kung may hihilingin na paghinto ang pasahero o may naghihintay sumakay.',
    'Timepoint': 'Timepoint',
    "Similar to a regular stop, but if the driver is running early, they'll hold here until the scheduled leave time.":
      'Katulad ng regular na hintuan, pero kung maaga ang driver, maghihintay siya dito hanggang sa iskedyul ng paalis.',
    'Temporary Stop': 'Pansamantalang Hintuan',
    'Like a normal stop, but not permanent. Usually for construction or temporary route changes. Sometimes marked with an A-frame sign, but not always.':
      'Katulad ng regular na hintuan, pero hindi permanente. Karaniwan para sa konstruksyon o pansamantalang pagbabago ng ruta. Minsan may markang A-frame sign, pero hindi palagi.',
    'STOP TYPES': 'MGA URI NG HINTUAN',
    'HOW TO RIDE': 'PAANO SUMAKAY',
    'TIP': 'TIP',
    'Stop Request': 'Kahilingan sa Paghinto',
    'Pull the cord or push the strip when you hear your stop being announced. Otherwise, the driver will keep driving and can only drop you off at the next stop.':
      'Hilahin ang kordon o pindutin ang strip kapag narinig mong ianunsyo ang iyong hintuan. Kung hindi, magpapatuloy ang driver at doon ka lang maibababa sa susunod na hintuan.',
    'Some routes share stops on the other side of the road. It might be faster or easier to wait for the bus to come back around to the adjacent stop.':
      'May mga rutang magkasamang gumagamit ng hintuan sa kabilang panig ng kalsada. Maaaring mas mabilis o mas madali na hintayin na lang ang bus na bumalik sa katabing hintuan.',
    'Not Every Stop Is Automatic': 'Hindi Awtomatikong Humihinto sa Bawat Hintuan',
    "If no one's waiting at the stop, the bus isn't stopping.\n\nDrivers aren't required to stop at any stop unless they're running ahead of schedule (at a timepoint), have passengers to pick up, or you requested it.":
      'Kung walang naghihintay sa hintuan, hindi hihinto ang bus.\n\nHindi kinakailangang huminto ang mga driver sa anumang hintuan maliban kung sila ay maaga sa iskedyul (sa isang timepoint), may sasakay na pasahero, o hiniling mo ito.',
    'Plan Ahead': 'Magplano Nang Maaga',
    'Leave earlier than you think you need to, especially during the beginning of the semester or peak riding times.\n\nNobody knows exactly how timing will be affected by traffic, ridership, accidents, etc.':
      'Umalis nang mas maaga kaysa sa akala mong kailangan, lalo na sa simula ng semestre o sa mga peak na oras ng pagsakay.\n\nWalang nakakaalam nang eksakto kung paano maaapektuhan ang oras ng trapiko, bilang ng pasahero, aksidente, atbp.',
    'Full Bus / "Another Bus Follows"': 'Puno ang Bus / "May Susunod na Bus"',
    'Backpacks off, move back, make two rows. The busses can fit about 70 people. If a bus has to leave you behind, there\'s always another one behind it.\n\n"Another Bus Follows" on the marquee means the bus is full and will only stop to let people off. You will have to catch the next one.':
      'Alisin ang backpack, umatras, gumawa ng dalawang hanay. Kasya ang mga bus ng humigit-kumulang 70 katao. Kung maiwan ka ng isang bus, laging may susunod pa.\n\nAng "May Susunod na Bus" sa marquee ay nangangahulugang puno na ang bus at hihinto lang para magpababa ng pasahero. Kailangan mong sumakay sa susunod.',
    'Rush Hours': 'Mga Oras ng Trapiko',
    'Expect busses to be running late or full during rush hours: 7-8 AM, class changes, 3 PM, and 5 PM.':
      'Asahan na maaantala o mapupuno ang mga bus sa mga oras ng trapiko: 7-8 AM, pagpalit ng klase, 3 PM, at 5 PM.',
    'Mobility Devices & Bikes': 'Mga Mobility Device at Bisikleta',
    "Scooters, one-wheels, and similar devices need to be folded and stowed under a seat. Bikes are not allowed on buses.\n\nIf you can't take it on the bus, park it or ride it. These items are trip hazards and become projectiles in accidents. Please be courteous to everyone else.":
      'Kailangang tiklupin at itago sa ilalim ng upuan ang mga scooter, one-wheel, at katulad na device. Hindi pinapayagan ang bisikleta sa bus.\n\nKung hindi mo ito madadala sa bus, iparada na lang o sakyan na lang ito. Ang mga bagay na ito ay panganib sa pagkatisod at maaaring maging proyektil sa mga aksidente. Mangyaring maging magalang sa lahat.',
    'Uses a stronger-contrast color palette throughout the app': 'Gumagamit ng mas matinding contrast na kulay sa buong app',
    "Shortens or removes the app's animations": 'Pinapaikli o inaalis ang mga animation ng app',
    'Monday - Friday, 5:00 AM - 7:00 PM': 'Lunes - Biyernes, 5:00 AM - 7:00 PM',
    '*Must present a valid student, faculty, or staff ID.': '*Kailangang magpakita ng balidong ID ng estudyante, faculty, o staff.',
    '*S&D Punch Passes are only available to clients who have been issued either a S-Pass or D-Pass card.':
      '*Ang S&D Punch Passes ay para lamang sa mga kliyenteng binigyan ng S-Pass o D-Pass card.',
    'Monday – Friday, 5:00 AM – 7:00 PM': 'Lunes - Biyernes, 5:00 AM - 7:00 PM',
    'MORE SERVICES': 'IBA PANG SERBISYO',
    'For info about Senior/Disabled & Medicare passes, ADA Paratransit, and Demand & Response service, visit':
      'Para sa impormasyon tungkol sa Senior/Disabled at Medicare passes, ADA Paratransit, at Demand & Response service, bisitahin ang',
    'or call': 'o tumawag sa',
    'RIDING POLICY': 'PATAKARAN SA PAGSAKAY',
    'CONTACT & QUESTIONS': 'KONTAK AT MGA TANONG',
    'Calls BTD': 'Tumatawag sa BTD',
    'Trip planning & general info': 'Pagpaplano ng biyahe at pangkalahatang impormasyon',
    'Opens in your browser': 'Magbubukas sa iyong browser',
    'Website': 'Website',
    'Social media': 'Social media',
    "Shows this day's transit schedule changes": 'Ipinapakita ang mga pagbabago sa iskedyul ng transit sa araw na ito',
    'Dismiss': 'Isara',
    'Sunday': 'Linggo',
    'Monday': 'Lunes',
    'Tuesday': 'Martes',
    'Wednesday': 'Miyerkules',
    'Thursday': 'Huwebes',
    'Friday': 'Biyernes',
    'Saturday': 'Sabado',

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
    'Settings': 'Configurações',
    'Theme, Language, and Accessibility': 'Tema, idioma e acessibilidade',

    // ── Tour, Help Guide, and misc (new) ────────────────────────────────
    'of': 'de',
    'Skip': 'Pular',
    'Skip tour': 'Pular tour',
    'Finish': 'Concluir',
    'Finish tour': 'Concluir tour',
    'Next': 'Próximo',
    'Pick Your Routes': 'Escolha Suas Rotas',
    'Tap here to choose which routes show live buses on the map.': 'Toque aqui para escolher quais rotas mostram ônibus ao vivo no mapa.',
    'Pin the routes you ride most so they sort to the top of the selector.': 'Fixe as rotas que você mais usa para que apareçam no topo do seletor.',
    'Turn on alerts for delays and reroutes on your routes.': 'Ative alertas de atrasos e desvios para suas rotas.',
    'Riding BTD?': 'Vai pegar o BTD?',
    'Switch over to Brazos Transit District from here anytime - or set it as your default in the toggle right below.':
      'Mude para o Brazos Transit District a qualquer momento a partir daqui - ou defina-o como padrão na chave abaixo.',
    'New Here?': 'Novo por Aqui?',
    'The Help Guide covers stop types and tips for riding the bus.': 'O Guia de Ajuda aborda os tipos de parada e dicas para andar de ônibus.',
    'Normal Stop': 'Parada Normal',
    "Just a regular stop on the route. The driver will stop if a passenger requests the stop or if someone's waiting to board.":
      'Apenas uma parada regular da rota. O motorista vai parar se um passageiro solicitar ou se alguém estiver esperando para embarcar.',
    'Timepoint': 'Ponto de controle',
    "Similar to a regular stop, but if the driver is running early, they'll hold here until the scheduled leave time.":
      'Semelhante a uma parada regular, mas se o motorista estiver adiantado, ele aguardará aqui até o horário de saída programado.',
    'Temporary Stop': 'Parada Temporária',
    'Like a normal stop, but not permanent. Usually for construction or temporary route changes. Sometimes marked with an A-frame sign, but not always.':
      'Como uma parada normal, mas não permanente. Geralmente por obras ou mudanças temporárias de rota. Às vezes marcada com uma placa em cavalete, mas nem sempre.',
    'STOP TYPES': 'TIPOS DE PARADA',
    'HOW TO RIDE': 'COMO VIAJAR',
    'TIP': 'DICA',
    'Stop Request': 'Solicitação de Parada',
    'Pull the cord or push the strip when you hear your stop being announced. Otherwise, the driver will keep driving and can only drop you off at the next stop.':
      'Puxe o cordão ou pressione a faixa quando ouvir sua parada sendo anunciada. Caso contrário, o motorista continuará dirigindo e só poderá deixá-lo na próxima parada.',
    'Some routes share stops on the other side of the road. It might be faster or easier to wait for the bus to come back around to the adjacent stop.':
      'Algumas rotas compartilham paradas do outro lado da rua. Pode ser mais rápido ou mais fácil esperar o ônibus voltar para a parada adjacente.',
    'Not Every Stop Is Automatic': 'Nem Toda Parada É Automática',
    "If no one's waiting at the stop, the bus isn't stopping.\n\nDrivers aren't required to stop at any stop unless they're running ahead of schedule (at a timepoint), have passengers to pick up, or you requested it.":
      'Se ninguém estiver esperando na parada, o ônibus não vai parar.\n\nOs motoristas não são obrigados a parar em nenhuma parada, a menos que estejam adiantados (em um ponto de controle), tenham passageiros para pegar, ou você tenha solicitado.',
    'Plan Ahead': 'Planeje com Antecedência',
    'Leave earlier than you think you need to, especially during the beginning of the semester or peak riding times.\n\nNobody knows exactly how timing will be affected by traffic, ridership, accidents, etc.':
      'Saia mais cedo do que você acha necessário, especialmente no início do semestre ou em horários de pico.\n\nNinguém sabe exatamente como o trânsito, o número de passageiros, acidentes, etc. afetarão os horários.',
    'Full Bus / "Another Bus Follows"': 'Ônibus Lotado / "Outro Ônibus Vem a Seguir"',
    'Backpacks off, move back, make two rows. The busses can fit about 70 people. If a bus has to leave you behind, there\'s always another one behind it.\n\n"Another Bus Follows" on the marquee means the bus is full and will only stop to let people off. You will have to catch the next one.':
      'Tire a mochila, vá para trás, forme duas filas. Os ônibus comportam cerca de 70 pessoas. Se um ônibus tiver que deixá-lo para trás, sempre há outro atrás dele.\n\n"Outro Ônibus Vem a Seguir" no letreiro significa que o ônibus está lotado e só vai parar para deixar as pessoas descerem. Você terá que pegar o próximo.',
    'Rush Hours': 'Horários de Pico',
    'Expect busses to be running late or full during rush hours: 7-8 AM, class changes, 3 PM, and 5 PM.':
      'Espere que os ônibus estejam atrasados ou lotados nos horários de pico: 7h-8h, trocas de aula, 15h e 17h.',
    'Mobility Devices & Bikes': 'Dispositivos de Mobilidade e Bicicletas',
    "Scooters, one-wheels, and similar devices need to be folded and stowed under a seat. Bikes are not allowed on buses.\n\nIf you can't take it on the bus, park it or ride it. These items are trip hazards and become projectiles in accidents. Please be courteous to everyone else.":
      'Patinetes, monociclos e dispositivos semelhantes precisam ser dobrados e guardados sob um assento. Bicicletas não são permitidas nos ônibus.\n\nSe não puder levá-lo no ônibus, estacione-o ou pedale até o destino. Esses itens representam risco de tropeço e podem se tornar projéteis em acidentes. Por favor, seja gentil com os demais.',
    'Uses a stronger-contrast color palette throughout the app': 'Usa uma paleta de cores com contraste mais forte em todo o aplicativo',
    "Shortens or removes the app's animations": 'Encurta ou remove as animações do aplicativo',
    'Monday - Friday, 5:00 AM - 7:00 PM': 'Segunda - Sexta, 5:00 - 19:00',
    '*Must present a valid student, faculty, or staff ID.': '*É necessário apresentar identidade válida de estudante, docente ou funcionário.',
    '*S&D Punch Passes are only available to clients who have been issued either a S-Pass or D-Pass card.':
      '*Os passes S&D Punch estão disponíveis apenas para clientes que possuem um cartão S-Pass ou D-Pass.',
    'Monday – Friday, 5:00 AM – 7:00 PM': 'Segunda - Sexta, 5:00 - 19:00',
    'MORE SERVICES': 'MAIS SERVIÇOS',
    'For info about Senior/Disabled & Medicare passes, ADA Paratransit, and Demand & Response service, visit':
      'Para informações sobre passes para idosos/deficientes e Medicare, ADA Paratransit, e serviço de demanda e resposta, visite',
    'or call': 'ou ligue para',
    'RIDING POLICY': 'POLÍTICA DE VIAGEM',
    'CONTACT & QUESTIONS': 'CONTATO E DÚVIDAS',
    'Calls BTD': 'Liga para o BTD',
    'Trip planning & general info': 'Planejamento de viagem e informações gerais',
    'Opens in your browser': 'Abre no seu navegador',
    'Website': 'Site',
    'Social media': 'Redes sociais',
    "Shows this day's transit schedule changes": 'Mostra as mudanças no horário de trânsito deste dia',
    'Dismiss': 'Fechar',
    'Sunday': 'Domingo',
    'Monday': 'Segunda-feira',
    'Tuesday': 'Terça-feira',
    'Wednesday': 'Quarta-feira',
    'Thursday': 'Quinta-feira',
    'Friday': 'Sexta-feira',
    'Saturday': 'Sábado',

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
