
document.addEventListener('DOMContentLoaded', function() {
    // حفظ المستخدم في localStorage
    const users = {
        'admin@water.com': { password: 'Admin@2024', name: 'أحمد محمد', role: 'admin' },
        'tech@water.com': { password: 'Tech@2024', name: 'محمود علي', role: 'tech' }
    };

    let currentUser = null;
    let map = null;
    let charts = [];
    let stationsData = [];

    // التحقق من وجود جلسة مسجلة
    checkLoginStatus();

    function checkLoginStatus() {
        const loggedIn = localStorage.getItem('waterQualityLoggedIn');
        const userEmail = localStorage.getItem('waterQualityUser');
        
        if (loggedIn === 'true' && userEmail && users[userEmail]) {
            currentUser = users[userEmail];
            document.body.classList.add('logged-in');
            document.getElementById('current-user-name').textContent = currentUser.name;
            document.getElementById('current-user-role').textContent = 
                currentUser.role === 'admin' ? 'مسؤول النظام' : 
                currentUser.role === 'tech' ? 'فني مختبر' : 'مراقب جودة';
            initApp();
        }
    }

    // تبديل التبويبات
    document.querySelectorAll('.login-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.login-form').forEach(f => f.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tabName + '-form').classList.add('active');
        });
    });

    // الحسابات التجريبية
    document.querySelectorAll('.demo-account').forEach(account => {
        account.addEventListener('click', () => {
            document.getElementById('email').value = account.dataset.email;
            document.getElementById('password').value = account.dataset.password;
            document.querySelectorAll('.login-tab')[0].click();
        });
    });

    // تسجيل الدخول
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        const loginBtn = document.getElementById('loginButton');
        const spinner = loginBtn.querySelector('i');
        const btnText = loginBtn.querySelector('span');
        
        spinner.style.display = 'inline-block';
        btnText.textContent = 'جاري تسجيل الدخول...';
        loginBtn.disabled = true;

        // محاكاة اتصال بالخادم
        setTimeout(() => {
            if (users[email] && users[email].password === password) {
                currentUser = users[email];
                
                // حفظ حالة الدخول في localStorage
                if (rememberMe) {
                    localStorage.setItem('waterQualityLoggedIn', 'true');
                    localStorage.setItem('waterQualityUser', email);
                    localStorage.setItem('waterQualityUserName', currentUser.name);
                    localStorage.setItem('waterQualityUserRole', currentUser.role);
                } else {
                    localStorage.setItem('waterQualityLoggedIn', 'true');
                    localStorage.setItem('waterQualityUser', email);
                }
                
                showMessage('login-message', 'تم تسجيل الدخول بنجاح!', 'success');
                
                setTimeout(() => {
                    document.body.classList.add('logged-in');
                    document.getElementById('current-user-name').textContent = currentUser.name;
                    document.getElementById('current-user-role').textContent = 
                        currentUser.role === 'admin' ? 'مسؤول النظام' : 
                        currentUser.role === 'tech' ? 'فني مختبر' : 'مراقب جودة';
                    initApp();
                    
                    spinner.style.display = 'none';
                    btnText.textContent = 'دخول النظام';
                    loginBtn.disabled = false;
                }, 1000);
            } else {
                showMessage('login-message', 'البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
                spinner.style.display = 'none';
                btnText.textContent = 'دخول النظام';
                loginBtn.disabled = false;
            }
        }, 1500);
    });

    // التسجيل
    document.getElementById('register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;

        if (password !== confirmPassword) {
            showMessage('register-message', 'كلمات المرور غير متطابقة', 'error');
            return;
        }

        showMessage('register-message', 'تم إنشاء الحساب بنجاح!', 'success');
    });

    // استعادة كلمة المرور
    document.getElementById('reset-form').addEventListener('submit', (e) => {
        e.preventDefault();
        showMessage('reset-message', 'تم إرسال رابط الاستعادة إلى بريدك الإلكتروني', 'success');
    });

    // روابط التنقل
    document.getElementById('show-reset-tab').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.login-tab')[2].click();
    });

    document.getElementById('back-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.login-tab')[0].click();
    });

    // إظهار/إخفاء كلمة المرور
    ['toggleLoginPassword', 'toggleRegPassword', 'toggleConfirmPassword'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                const input = btn.previousElementSibling.previousElementSibling;
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;
                btn.querySelector('i').className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
            });
        }
    });

    // فحص قوة كلمة المرور
    const regPassword = document.getElementById('reg-password');
    if (regPassword) {
        regPassword.addEventListener('input', (e) => {
            const password = e.target.value;
            const bar = document.getElementById('password-strength-bar');
            const hint = document.getElementById('password-hint');
            
            let strength = 0;
            if (password.length >= 8) strength++;
            if (/[A-Z]/.test(password)) strength++;
            if (/[a-z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^A-Za-z0-9]/.test(password)) strength++;
            
            bar.style.width = (strength * 20) + '%';
            bar.className = 'password-strength-bar';
            
            if (strength < 2) {
                bar.classList.add('strength-weak');
                hint.textContent = 'كلمة مرور ضعيفة';
                hint.style.color = '#e6555a';
            } else if (strength < 4) {
                bar.classList.add('strength-medium');
                hint.textContent = 'كلمة مرور متوسطة';
                hint.style.color = '#fdae6b';
            } else {
                bar.classList.add('strength-strong');
                hint.textContent = 'كلمة مرور قوية';
                hint.style.color = '#31a354';
            }
        });
    }

    // التنقل في التطبيق
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            
            link.classList.add('active');
            const pageId = link.dataset.page + '-page';
            document.getElementById(pageId).classList.add('active');
            
            if (pageId === 'map-page') {
                initMap();
            }
            
            if (pageId === 'dashboard-page') {
                initCharts();
            }
        });
    });

    // تسجيل الخروج
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
                // مسح بيانات localStorage
                localStorage.removeItem('waterQualityLoggedIn');
                localStorage.removeItem('waterQualityUser');
                
                document.body.classList.remove('logged-in');
                currentUser = null;
                document.getElementById('email').value = '';
                document.getElementById('password').value = '';
                if (map) {
                    map.remove();
                    map = null;
                }
                charts.forEach(chart => chart.destroy());
                charts = [];
            }
        });
    }

    // الوضع الليلي
    const darkModeToggle = document.getElementById('dark-mode');
    if (darkModeToggle) {
        // تحميل إعدادات الوضع الليلي من localStorage
        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        }
        
        darkModeToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'true');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'false');
            }
        });
    }

    // حاسبة استهلاك المياه
    const calculateWaterBtn = document.getElementById('calculate-water');
    if (calculateWaterBtn) {
        calculateWaterBtn.addEventListener('click', () => {
            const weight = parseFloat(document.getElementById('weight-input').value);
            const activityLevel = parseFloat(document.getElementById('activity-level').value);
            
            if (weight && weight >= 30 && weight <= 200) {
                // حساب احتياجات الماء (35 مل لكل كجم من الوزن)
                const waterNeeds = (weight * 35 * activityLevel) / 1000;
                const cups = Math.round(waterNeeds * 4);
                
                document.getElementById('water-needs').textContent = waterNeeds.toFixed(1) + ' لتر';
                document.getElementById('water-equivalent').textContent = cups + ' كوب';
                document.getElementById('water-result').style.display = 'block';
            } else {
                alert('الرجاء إدخال وزن صحيح بين 30 و 200 كجم');
            }
        });
    }

    // دالة عرض الرسائل
    function showMessage(id, message, type) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = message;
            element.className = 'message ' + type;
            element.style.display = 'block';
            setTimeout(() => {
                element.style.display = 'none';
            }, 5000);
        }
    }

    // تهيئة التطبيق
    function initApp() {
        initCharts();
        loadUserPreferences();
        
        // تحميل آخر صفحة كان المستخدم فيها
        const lastPage = localStorage.getItem('lastPage') || 'home';
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.dataset.page === lastPage) {
                link.click();
            }
        });
    }

    // تحميل تفضيلات المستخدم
    function loadUserPreferences() {
        // تحميل إعدادات الوضع الليلي
        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) {
            document.body.classList.add('dark-mode');
            if (document.getElementById('dark-mode')) {
                document.getElementById('dark-mode').checked = true;
            }
        }
    }

    // حفظ آخر صفحة زارها المستخدم
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            localStorage.setItem('lastPage', link.dataset.page);
        });
    });

    // تهيئة الرسوم البيانية
    function initCharts() {
        const waterQualityCtx = document.getElementById('waterQualityChart');
        if (waterQualityCtx) {
            const waterChart = new Chart(waterQualityCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'],
                    datasets: [
                        {
                            label: 'الأس الهيدروجيني',
                            data: [7.1, 7.3, 7.0, 7.2, 7.4, 7.1, 7.2],
                            borderColor: '#2c7fb8',
                            backgroundColor: 'rgba(44, 127, 184, 0.1)',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'العكورة (NTU)',
                            data: [2.5, 2.8, 3.2, 2.1, 1.9, 2.3, 2.1],
                            borderColor: '#7fcdbb',
                            backgroundColor: 'rgba(127, 205, 187, 0.1)',
                            tension: 0.4,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            rtl: true
                        }
                    }
                }
            });
            charts.push(waterChart);
        }

        const stationsStatusCtx = document.getElementById('stationsStatusChart');
        if (stationsStatusCtx) {
            const statusChart = new Chart(stationsStatusCtx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['طبيعي', 'تحذير', 'حرج'],
                    datasets: [{
                        data: [3, 1, 1],
                        backgroundColor: ['#31a354', '#fdae6b', '#e6555a']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            rtl: true
                        }
                    }
                }
            });
            charts.push(statusChart);
        }

        const solarProductionCtx = document.getElementById('solarProductionChart');
        if (solarProductionCtx) {
            const solarChart = new Chart(solarProductionCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['6 ص', '9 ص', '12 ظ', '3 م', '6 م', '9 م'],
                    datasets: [{
                        label: 'إنتاج الطاقة (كيلوواط/ساعة)',
                        data: [0.5, 1.8, 2.4, 1.9, 0.8, 0.2],
                        backgroundColor: '#f9c74f',
                        borderColor: '#f9844a',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            rtl: true
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'كيلوواط/ساعة'
                            }
                        }
                    }
                }
            });
            charts.push(solarChart);
        }
    }

    // تهيئة الخريطة
    function initMap() {
        const mapElement = document.getElementById('map');
        if (!mapElement) return;

        if (map) {
            map.remove();
        }

        try {
            map = L.map('map').setView([30.0444, 31.2357], 7);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            
            // بيانات المحطات
            stationsData = [
                { 
                    id: 1,
                    lat: 30.0444, 
                    lng: 31.2357, 
                    name: 'محطة النيل الرئيسية', 
                    status: 'normal',
                    ph: 7.2,
                    turbidity: 2.1,
                    oxygen: 8.4,
                    temperature: 24,
                    lastUpdate: 'منذ 5 دقائق'
                },
                { 
                    id: 2,
                    lat: 31.4044, 
                    lng: 30.4167, 
                    name: 'فرع رشيد', 
                    status: 'warning',
                    ph: 6.8,
                    turbidity: 4.2,
                    oxygen: 6.1,
                    temperature: 26,
                    lastUpdate: 'منذ 12 دقيقة'
                },
                { 
                    id: 3,
                    lat: 31.0414, 
                    lng: 31.3583, 
                    name: 'فرع دمياط', 
                    status: 'normal',
                    ph: 7.4,
                    turbidity: 2.1,
                    oxygen: 7.9,
                    temperature: 23,
                    lastUpdate: 'منذ 8 دقائق'
                },
                { 
                    id: 4,
                    lat: 30.5833, 
                    lng: 32.2667, 
                    name: 'قناة الإسماعيلية', 
                    status: 'critical',
                    ph: 5.9,
                    turbidity: 8.5,
                    oxygen: 4.2,
                    temperature: 28,
                    lastUpdate: 'منذ 20 دقيقة'
                },
                { 
                    id: 5,
                    lat: 23.9667, 
                    lng: 32.8833, 
                    name: 'بحيرة ناصر', 
                    status: 'normal',
                    ph: 7.0,
                    turbidity: 1.8,
                    oxygen: 8.1,
                    temperature: 22,
                    lastUpdate: 'منذ 15 دقيقة'
                }
            ];
            
            // إضافة المحطات إلى الخريطة
            addStationsToMap();
            
            // إعدادات التحكم
            setupMapControls();

            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        } catch (error) {
            console.error('Error initializing map:', error);
        }
    }

    // إضافة المحطات إلى الخريطة
    function addStationsToMap(filter = 'all') {
        // إزالة جميع المحطات الحالية
        map.eachLayer((layer) => {
            if (layer instanceof L.CircleMarker) {
                map.removeLayer(layer);
            }
        });

        // إضافة المحطات المصفاة
        stationsData.forEach(station => {
            if (filter === 'all' || station.status === filter) {
                let color;
                let icon;
                
                if (station.status === 'normal') {
                    color = '#31a354';
                    icon = 'check-circle';
                } else if (station.status === 'warning') {
                    color = '#fdae6b';
                    icon = 'exclamation-triangle';
                } else {
                    color = '#e6555a';
                    icon = 'skull-crossbones';
                }
                
                const marker = L.circleMarker([station.lat, station.lng], {
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.7,
                    radius: 8
                }).addTo(map);
                
                marker.bindPopup(`
                    <div style="text-align: right;">
                        <h4 style="margin-bottom: 10px; color: ${color}">
                            <i class="fas fa-${icon}"></i> ${station.name}
                        </h4>
                        <p><strong>الحالة:</strong> ${station.status === 'normal' ? 'طبيعي' : station.status === 'warning' ? 'تحذير' : 'حرج'}</p>
                        <p><strong>آخر تحديث:</strong> ${station.lastUpdate}</p>
                        <button onclick="showStationDetails(${station.id})" style="background: ${color}; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; margin-top: 10px;">
                            <i class="fas fa-info-circle"></i> عرض التفاصيل
                        </button>
                    </div>
                `);
                
                marker.on('click', () => {
                    showStationDetails(station.id);
                });
            }
        });
    }

    // إعداد عناصر التحكم في الخريطة
    function setupMapControls() {
        // أزرار التصفية
        document.querySelectorAll('.control-btn[data-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.control-btn[data-filter]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;
                addStationsToMap(filter);
            });
        });

        // أزرار الطبقات
        document.querySelectorAll('.control-btn[data-layer]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.control-btn[data-layer]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                if (btn.dataset.layer === 'satellite') {
                    map.eachLayer((layer) => {
                        if (layer instanceof L.TileLayer) {
                            map.removeLayer(layer);
                        }
                    });
                    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                        attribution: '© Esri'
                    }).addTo(map);
                } else {
                    map.eachLayer((layer) => {
                        if (layer instanceof L.TileLayer) {
                            map.removeLayer(layer);
                        }
                    });
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors'
                    }).addTo(map);
                }
            });
        });

        // زر تحديث الخريطة
        document.getElementById('refresh-map').addEventListener('click', () => {
            // محاكاة تحديث البيانات
            stationsData.forEach(station => {
                station.lastUpdate = 'منذ 0 دقائق';
            });
            
            const activeFilter = document.querySelector('.control-btn[data-filter].active').dataset.filter;
            addStationsToMap(activeFilter);
            
            // إظهار رسالة نجاح
            showMessage('login-message', 'تم تحديث بيانات الخريطة بنجاح', 'success');
        });
    }

    // عرض تفاصيل المحطة
    window.showStationDetails = function(stationId) {
        const station = stationsData.find(s => s.id === stationId);
        if (!station) return;

        const infoDiv = document.getElementById('selected-station-info');
        const metricsDiv = document.getElementById('station-metrics');

        infoDiv.innerHTML = `
            <h3 style="color: var(--primary); margin-bottom: 10px;">
                <i class="fas fa-${station.status === 'normal' ? 'check-circle' : station.status === 'warning' ? 'exclamation-triangle' : 'skull-crossbones'}"></i>
                ${station.name}
            </h3>
            <p><strong>الحالة:</strong> ${station.status === 'normal' ? 'طبيعي' : station.status === 'warning' ? 'تحذير' : 'حرج'}</p>
            <p><strong>آخر تحديث:</strong> ${station.lastUpdate}</p>
        `;

        document.getElementById('station-ph').textContent = station.ph;
        document.getElementById('station-turbidity').textContent = station.turbidity;
        document.getElementById('station-oxygen').textContent = station.oxygen;
        document.getElementById('station-temperature').textContent = station.temperature + '°C';

        metricsDiv.style.display = 'grid';
    };
});