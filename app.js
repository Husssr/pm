    document.addEventListener('DOMContentLoaded', () => {
        
        // 1. จัดการเวลา Real-time
        const clockElement = document.getElementById('realtime-clock');
        const updateTimeElement = document.getElementById('mock-update-time');
        
        function updateClock() {
            const now = new Date();
            const timeString = now.toLocaleTimeString('th-TH');
            if(clockElement) clockElement.textContent = timeString;
        }
        setInterval(updateClock, 1000);
        updateClock(); // เรียกครั้งแรกทันที

        // ตั้งเวลาอัปเดตข้อมูลจำลองเริ่มต้น
        const now = new Date();
        if(updateTimeElement) updateTimeElement.textContent = `${now.toLocaleDateString('th-TH')} ${now.getHours().toString().padStart(2, '0')}:00 น.`;

        // 2. จัดการ Cookie Consent แบบแบนเนอร์ด้านล่าง
        checkCookieConsent();

        function checkCookieConsent() {
            const cookieAccepted = localStorage.getItem('cookieAccepted');
            const cookieBanner = document.getElementById('cookie-banner');
            const acceptBtn = document.getElementById('btn-accept-cookie');
            const declineBtn = document.getElementById('btn-decline-cookie');

            if (!cookieAccepted && cookieBanner) {
                setTimeout(() => {
                    cookieBanner.classList.remove('hidden');
                    setTimeout(() => cookieBanner.classList.add('show'), 50);
                }, 1000);

                if(acceptBtn) acceptBtn.addEventListener('click', () => {
                    localStorage.setItem('cookieAccepted', 'granted');
                    closeCookieBanner();
                });

                if(declineBtn) declineBtn.addEventListener('click', () => {
                    localStorage.setItem('cookieAccepted', 'denied');
                    closeCookieBanner();
                });
            }

            function closeCookieBanner() {
                cookieBanner.classList.remove('show');
                setTimeout(() => {
                    cookieBanner.classList.add('hidden');
                }, 600);
            }
        }

        // 3. เงื่อนไขการแสดงปุ่ม "ติดต่อฉัน" แบบวิดเจ็ตลอย
        let hasContactInfo = false; // ถ้าแอดมินเพิ่มแล้วจะเป็น true
        const contactWidget = document.getElementById('contact-widget');
        if (hasContactInfo && contactWidget) {
            contactWidget.classList.remove('hidden');
        }
    });

    // ==========================================
    // ระบบการล็อกอินและ Firebase Logic
    // ==========================================
    document.addEventListener('DOMContentLoaded', () => {
        let isRegisterMode = false;

        const authCard = document.getElementById('auth-card');
        const authTitle = document.getElementById('auth-title');
        const authSubtitle = document.getElementById('auth-subtitle');
        const confirmGroup = document.getElementById('confirm-password-group');
        const submitBtn = document.getElementById('btn-submit-auth');
        const switchLink = document.getElementById('auth-toggle-mode');
        const switchText = document.getElementById('auth-switch-text');
        const userMenuZone = document.getElementById('user-menu-zone');

        if(switchLink) {
            switchLink.addEventListener('click', (e) => {
                e.preventDefault();
                isRegisterMode = !isRegisterMode;
                if(isRegisterMode) {
                    authTitle.textContent = "สมัครสมาชิก";
                    authSubtitle.textContent = "สร้างบัญชีใหม่เพื่อร่วมส่งข้อมูลรายงานฝุ่น";
                    confirmGroup.classList.remove('hidden');
                    submitBtn.textContent = "ลงทะเบียน";
                    switchText.textContent = "มีบัญชีผู้ใช้อยู่แล้ว?";
                    switchLink.textContent = "เข้าสู่ระบบที่นี่";
                } else {
                    authTitle.textContent = "เข้าสู่ระบบ";
                    authSubtitle.textContent = "ยินดีต้อนรับกลับเข้าสู่ระบบรายงานฝุ่น AIRWISE";
                    confirmGroup.classList.add('hidden');
                    submitBtn.textContent = "เข้าสู่ระบบ";
                    switchText.textContent = "ยังไม่มีบัญชีผู้ใช้?";
                    switchLink.textContent = "สมัครสมาชิกที่นี่";
                }
            });
        }

        const setupPasswordToggle = (iconId, inputId) => {
            const icon = document.getElementById(iconId);
            const input = document.getElementById(inputId);
            if(icon && input) {
                icon.addEventListener('click', () => {
                    if(input.type === 'password') {
                        input.type = 'text';
                        icon.classList.replace('fa-solid-eye-slash', 'fa-solid-eye');
                        icon.className = "fa-solid fa-eye toggle-password";
                    } else {
                        input.type = 'password';
                        icon.className = "fa-solid fa-eye-slash toggle-password";
                    }
                });
            }
        };
        setupPasswordToggle('toggle-p1', 'auth-password');
        setupPasswordToggle('toggle-p2', 'auth-confirm-password');

        if (window.fbOnAuthStateChanged && window.fbAuth) {
            window.fbOnAuthStateChanged(window.fbAuth, async (user) => {
                if (user) {
                    if(localStorage.getItem('adminToken') === 'true') {
                        setAdminNavbar();
                        return;
                    }
                    let displayName = user.displayName || user.email.split('@')[0];
                    let displayShort = displayName.length > 8 ? displayName.substring(0, 8) + '...' : displayName;
                    
                    if(userMenuZone) {
                        userMenuZone.innerHTML = `
                            <div class="navbar-user-profile">
                                <i class="fa-solid fa-user text-blue"></i>
                                <span class="nav-username-display" title="${displayName}">${displayShort}</span>
                                <button class="btn-logout-trigger" id="navbar-logout-btn" title="ออกจากระบบ"><i class="fa-solid fa-right-from-bracket"></i></button>
                            </div>
                        `;
                        document.getElementById('navbar-logout-btn').addEventListener('click', handleLogout);
                    }
                } else {
                    if(localStorage.getItem('adminToken') === 'true') {
                        setAdminNavbar();
                    } else if(userMenuZone) {
                        userMenuZone.innerHTML = `<i class="fa-solid fa-user-plus"></i> <span>เข้าสู่ระบบ</span>`;
                    }
                }
            });
        }

        function setAdminNavbar() {
            if(userMenuZone) {
                userMenuZone.innerHTML = `
                    <div class="navbar-user-profile" style="background: #FFF5F5;">
                        <i class="fa-solid fa-user-shield" style="color: #EF5350;"></i>
                        <span class="nav-username-display" style="color: #EF5350;">แอดมิน...</span>
                        <button class="btn-logout-trigger" id="navbar-logout-btn"><i class="fa-solid fa-right-from-bracket"></i></button>
                    </div>
                `;
                document.getElementById('navbar-logout-btn').addEventListener('click', handleLogout);
            }
        }

        function handleLogout() {
            localStorage.removeItem('adminToken');
            if(window.fbSignOut && window.fbAuth) {
                window.fbSignOut(window.fbAuth).then(() => {
                    Swal.fire({ icon: 'success', title: 'ออกจากระบบสำเร็จ', showConfirmButton: false, timer: 1200 });
                    setTimeout(() => location.reload(), 500);
                });
            } else {
                location.reload();
            }
        }

        const googleBtn = document.getElementById('btn-google-login');
        if(googleBtn && window.fbSignInWithPopup) {
            googleBtn.addEventListener('click', () => {
                const loader = document.getElementById('dust-component-loader');
                if(loader) loader.classList.remove('hidden'); 
                
                window.fbSignInWithPopup(window.fbAuth, window.fbGoogleProvider)
                    .then(async (result) => {
                        const user = result.user;
                        if(window.fbSetDoc && window.fbDb) {
                            await window.fbSetDoc(window.fbDoc(window.fbDb, "users", user.uid), {
                                uid: user.uid,
                                name: user.displayName,
                                email: user.email,
                                photoURL: user.photoURL,
                                lastLogin: new Date().toISOString()
                            }, { merge: true });
                        }
                        if(loader) loader.classList.add('hidden');
                        Swal.fire({ icon: 'success', title: 'ยินดีต้อนรับ', text: `คุณ ${user.displayName} เข้าสู่ระบบสำเร็จ` });
                        const homeView = document.querySelector('[data-view="home-view"]');
                        if(homeView) homeView.click();
                    })
                    .catch((error) => {
                        if(loader) loader.classList.add('hidden');
                        Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาดในการล็อกอิน', text: error.message });
                    });
            });
        }

        const emailForm = document.getElementById('email-auth-form');
        if(emailForm) {
            emailForm.addEventListener('submit', () => {
                const email = document.getElementById('auth-email').value;
                const password = document.getElementById('auth-password').value;
                const confirmPassword = document.getElementById('auth-confirm-password').value;

                if(!email.includes('@') || email.length < 5) {
                    Swal.fire({ icon: 'warning', title: 'รูปแบบอีเมลไม่ถูกต้อง', text: 'กรุณาตรวจสอบโครงสร้างอีเมลของคุณอีกครั้ง' });
                    return;
                }

                if(isRegisterMode) {
                    const hasUpperCase = /[A-Z]/.test(password);
                    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_]/.test(password);
                    
                    if(password.length < 6 || !hasUpperCase || !hasSpecialChar) {
                        Swal.fire({ icon: 'error', title: 'รหัสผ่านไม่ปลอดภัยพอ', text: 'รหัสผ่านใหม่ต้องมีความยาวมากกว่า 6 ตัวอักษร, ประกอบด้วยตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว และอักขระพิเศษอย่างน้อย 1 ตัว (!@#...)' });
                        return;
                    }
                    if(password !== confirmPassword) {
                        Swal.fire({ icon: 'error', title: 'รหัสผ่านไม่ตรงกัน', text: 'กรุณากรอกรหัสผ่านและยืนยันรหัสผ่านให้ตรงกันเป๊ะๆ' });
                        return;
                    }

                    if(window.fbCreateUserWithEmail) {
                        window.fbCreateUserWithEmail(window.fbAuth, email, password)
                            .then(async (res) => {
                                if(window.fbSetDoc && window.fbDb) {
                                    await window.fbSetDoc(window.fbDoc(window.fbDb, "users", res.user.uid), {
                                        uid: res.user.uid,
                                        email: email,
                                        role: 'member',
                                        createdTime: new Date().toISOString()
                                    });
                                }
                                Swal.fire({ icon: 'success', title: 'ลงทะเบียนสำเร็จ', text: 'ระบบสร้างบัญชีของคุณเรียบร้อยแล้ว' });
                                switchLink.click();
                            }).catch(err => Swal.fire({ icon: 'error', title: 'ลงทะเบียนล้มเหลว', text: err.message }));
                    }
                } else {
                    if(window.fbSignInWithEmail) {
                        window.fbSignInWithEmail(window.fbAuth, email, password)
                            .then(() => {
                                Swal.fire({ icon: 'success', title: 'เข้าสู่ระบบสำเร็จ' });
                                const homeView = document.querySelector('[data-view="home-view"]');
                                if(homeView) homeView.click();
                            }).catch(err => Swal.fire({ icon: 'error', title: 'ข้อมูลไม่ถูกต้อง', text: 'อีเมลหรือรหัสผ่านผิดพลาด กรุณาลองใหม่' }));
                    }
                }
            });
        }

        const adminBtn = document.getElementById('btn-admin-trigger');
        if(adminBtn) {
            adminBtn.addEventListener('click', () => {
                Swal.fire({
                    title: 'โปรดทราบ!',
                    text: 'สงวนสิทธิ์การใช้งานเฉพาะผู้ดูแลระบบที่มีสิทธิ์จัดการข้อมูลเท่านั้น',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'รับทราบและทำต่อ',
                    cancelButtonText: 'ยกเลิก',
                    confirmButtonColor: '#2B54A1'
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                            title: 'กรอกรหัสผู้ดูแลระบบ',
                            html: `
                                <input type="text" id="swal-admin-user" class="swal2-input" placeholder="User">
                                <input type="password" id="swal-admin-pass" class="swal2-input" placeholder="Password">
                            `,
                            focusConfirm: false,
                            confirmButtonText: 'ยืนยันสิทธิ์',
                            preConfirm: () => {
                                const u = document.getElementById('swal-admin-user').value;
                                const p = document.getElementById('swal-admin-pass').value;
                                return { user: u, pass: p };
                            }
                        }).then((adminResult) => {
                            if(adminResult.value) {
                                if(adminResult.value.user === 'pmproject' && adminResult.value.pass === 'pmadmin123') {
                                    localStorage.setItem('adminToken', 'true');
                                    Swal.fire({ icon: 'success', title: 'ยินดีต้อนรับแอดมิน', text: 'เข้าสู่โหมดควบคุมเว็บไซต์สำเร็จ' });
                                    setAdminNavbar();
                                    const homeView = document.querySelector('[data-view="home-view"]');
                                    if(homeView) homeView.click();
                                } else {
                                    Swal.fire({ icon: 'error', title: 'สิทธิ์ถูกปฏิเสธ', text: 'ชื่อผู้ใช้หรือรหัสแอดมินไม่ถูกต้อง!' });
                                }
                            }
                        });
                    }
                });
            });
        }
    });

    // ==========================================
    // ระบบแผนที่คุณภาพอากาศ 23 อำเภอ นครศรีธรรมราช (OpenWeatherMap API Real-time)
    // ==========================================
    (() => {
        const OPENWEATHER_API_KEY = "4e4ff35ad7c6dfc26ada54b1455b0f71"; 

        const NAKHON_CENTER_LAT = 8.4333;
        const NAKHON_CENTER_LON = 99.9667;
        
        const nakhonDistricts = [
            { name: "อ.เมือง", lat: 8.4333, lon: 99.9667 },
            { name: "อ.พรหมคีรี", lat: 8.5667, lon: 99.8167 },
            { name: "อ.ลานสกา", lat: 8.3500, lon: 99.7833 },
            { name: "อ.ฉวาง", lat: 8.3333, lon: 99.5000 },
            { name: "อ.พิปูน", lat: 8.5833, lon: 99.6000 },
            { name: "อ.เชียรใหญ่", lat: 8.0833, lon: 100.1333 },
            { name: "อ.ชะอวด", lat: 7.9667, lon: 99.9833 },
            { name: "อ.ท่าศาลา", lat: 8.6667, lon: 99.9333 },
            { name: "อ.ทุ่งสง", lat: 8.1667, lon: 99.6833 },
            { name: "อ.นาบอน", lat: 8.2667, lon: 99.6000 },
            { name: "อ.ทุ่งใหญ่", lat: 8.2833, lon: 99.3833 },
            { name: "อ.ปากพนัง", lat: 8.3500, lon: 100.2000 },
            { name: "อ.ร่อนพิบูลย์", lat: 8.1833, lon: 99.8500 },
            { name: "อ.สิชล", lat: 9.0000, lon: 99.9000 },
            { name: "อ.ขนอม", lat: 9.2000, lon: 99.8667 },
            { name: "อ.หัวไทร", lat: 8.0333, lon: 100.2833 },
            { name: "อ.บางขัน", lat: 8.0167, lon: 99.4667 },
            { name: "อ.ถ้ำพรรณรา", lat: 8.4333, lon: 99.3833 },
            { name: "อ.จุฬาภรณ์", lat: 8.0667, lon: 99.8833 },
            { name: "อ.พระพรหม", lat: 8.3333, lon: 99.9500 },
            { name: "อ.นบพิตำ", lat: 8.7667, lon: 99.7333 },
            { name: "อ.ช้างกลาง", lat: 8.3167, lon: 99.5833 },
            { name: "อ.เฉลิมพระเกียรติ", lat: 8.1833, lon: 100.0333 }
        ];

        function calcUsAqiFromPm25(pm25) {
            if (pm25 <= 12.0) return Math.round((50 / 12.0) * pm25);
            if (pm25 <= 35.4) return Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51);
            if (pm25 <= 55.4) return Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101);
            if (pm25 <= 150.4) return Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151);
            if (pm25 <= 250.4) return Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201);
            if (pm25 <= 350.4) return Math.round(((400 - 301) / (350.4 - 250.5)) * (pm25 - 250.5) + 301);
            return Math.round(((500 - 401) / (500.4 - 350.5)) * (pm25 - 350.5) + 401);
        }

        function getAqiType(aqi) {
            if (aqi <= 50) return 'good';
            if (aqi <= 100) return 'mod';
            if (aqi <= 150) return 'orange';
            if (aqi <= 200) return 'unhealthy';
            if (aqi <= 300) return 'purple';
            return 'maroon';
        }

        function getAqiTextTh(aqi) {
            if (aqi <= 50) return 'ดีมาก';
            if (aqi <= 100) return 'ปานกลาง';
            if (aqi <= 150) return 'เริ่มมีผลต่อสุขภาพ';
            if (aqi <= 200) return 'มีผลต่อสุขภาพ';
            if (aqi <= 300) return 'มีผลต่อสุขภาพมาก';
            return 'อันตรายร้ายแรง';
        }

        function initNakhonMapSystem() {
            const mapContainer = document.getElementById('real-map-container');
            if (!mapContainer || typeof L === 'undefined') return;

            // --- ล้างค่าแผนที่เก่าแบบ 100% ป้องกันกล่องเทา ---
            if (window.myNakhonMapInstance) {
                window.myNakhonMapInstance.off();
                window.myNakhonMapInstance.remove();
                window.myNakhonMapInstance = null;
            }
            if (mapContainer._leaflet_id) {
                mapContainer._leaflet_id = null;
            }
            mapContainer.innerHTML = '';
            
            const map = L.map('real-map-container', { attributionControl: false }).setView([NAKHON_CENTER_LAT, NAKHON_CENTER_LON], 9);
            window.myNakhonMapInstance = map;

            L.control.attribution({prefix: false}).addAttribution('© OpenStreetMap | Data by OpenWeatherMap').addTo(map);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);

            const fetchPromises = nakhonDistricts.map(dist => {
                const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${dist.lat}&lon=${dist.lon}&appid=${OPENWEATHER_API_KEY}`;
                return fetch(url).then(res => res.json()).catch(() => null); 
            });

            Promise.all(fetchPromises).then(results => {
                let totalAqi = 0, totalPm25 = 0, totalPm10 = 0;
                let validDistrictsCount = 0;

                nakhonDistricts.forEach((dist, index) => {
                    const data = results[index];
                    if (data && data.list && data.list.length > 0) {
                        const components = data.list[0].components;
                        
                        dist.pm25 = components.pm2_5 || 0;
                        dist.pm10 = components.pm10 || 0;
                        dist.aqi = calcUsAqiFromPm25(dist.pm25);

                        totalAqi += dist.aqi;
                        totalPm25 += dist.pm25;
                        totalPm10 += dist.pm10;
                        validDistrictsCount++;

                        const type = getAqiType(dist.aqi);
                        const markerEl = document.createElement('div');
                        markerEl.className = `custom-aqi-marker marker-${type}`;
                        markerEl.innerHTML = dist.aqi;

                        const customIcon = L.divIcon({ html: markerEl, className: '', iconSize: [36, 36] });
                        const marker = L.marker([dist.lat, dist.lon], { icon: customIcon }).addTo(map);
                        
                        marker.bindPopup(`
                            <div style="font-family: 'Kanit', sans-serif; min-width: 170px; padding: 5px;">
                                <strong style="color: #2B54A1; font-size: 15px; display:block; margin-bottom:5px;">📍 ${dist.name}</strong>
                                <div style="border-top: 1px solid #E2E8F0; padding-top: 5px; font-size: 13px; line-height: 1.6;">
                                    สถานะ: <b class="text-${type}">${getAqiTextTh(dist.aqi)}</b><br>
                                    ดัชนี AQI: <b>${dist.aqi}</b><br>
                                    PM2.5: <span>${dist.pm25} µg/m³</span><br>
                                    PM10: <span>${dist.pm10} µg/m³</span>
                                </div>
                            </div>
                        `);
                    }
                });

                if (validDistrictsCount > 0) {
                    const avgAqi = Math.round(totalAqi / validDistrictsCount);
                    const avgPm25 = (totalPm25 / validDistrictsCount).toFixed(1);
                    const avgPm10 = (totalPm10 / validDistrictsCount).toFixed(1);

                    const mainAqiVal = document.getElementById('main-aqi-val');
                    const mainAqiText = document.getElementById('main-aqi-text');
                    const mainPm25Val = document.getElementById('main-pm25-val');
                    const mainPm10Val = document.getElementById('main-pm10-val');
                    const mainDisplayBox = document.getElementById('main-aqi-display');
                    const updateTimeText = document.getElementById('real-update-time');

                    if(mainAqiVal) mainAqiVal.textContent = avgAqi;
                    if(mainAqiText) mainAqiText.textContent = getAqiTextTh(avgAqi);
                    if(mainPm25Val) mainPm25Val.textContent = `${avgPm25} µg/m³`;
                    if(mainPm10Val) mainPm10Val.textContent = `${avgPm10} µg/m³`;
                    if(mainDisplayBox) mainDisplayBox.className = `aqi-main marker-${getAqiType(avgAqi)}`;
                    
                    if(updateTimeText) {
                        const now = new Date();
                        updateTimeText.innerHTML = `<span style="color: #10B981;"><i class="fa-solid fa-clock-rotate-left"></i> ${now.toLocaleDateString('th-TH')} เวลา ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} น.</span>`;
                    }
                }

                setTimeout(() => map.invalidateSize(), 400);
            });

            setupNearbySystem(map);
        }

        function setupNearbySystem(mapInstance) {
            const btnAllowLoc = document.getElementById('btn-allow-location-card');
            const overlayLoc = document.getElementById('location-permission-overlay');
            const listLoc = document.getElementById('real-nearby-list');

            if (!btnAllowLoc) return;

            const newBtn = btnAllowLoc.cloneNode(true);
            btnAllowLoc.parentNode.replaceChild(newBtn, btnAllowLoc);

            newBtn.addEventListener('click', () => {
                newBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังวิเคราะห์พิกัด...';
                newBtn.disabled = true;

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const userLat = position.coords.latitude;
                            const userLon = position.coords.longitude;

                            mapInstance.setView([userLat, userLon], 11);

                            function calcKm(lat1, lon1, lat2, lon2) {
                                const R = 6371;
                                const dLat = (lat2 - lat1) * Math.PI / 180;
                                const dLon = (lon2 - lon1) * Math.PI / 180;
                                const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
                                return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
                            }

                            const nearby = nakhonDistricts.filter(d => d.aqi !== undefined).map(dist => {
                                dist.distance = calcKm(userLat, userLon, dist.lat, dist.lon);
                                return dist;
                            }).sort((a, b) => a.distance - b.distance);

                            if (listLoc) {
                                listLoc.innerHTML = '';
                                nearby.slice(0, 3).forEach(dist => {
                                    const type = getAqiType(dist.aqi);
                                    listLoc.innerHTML += `
                                        <li style="display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px dashed #E2E8F0;">
                                            <div>
                                                <span style="font-weight: 500; font-size: 14px; color:#1E293B;">📍 ${dist.name}</span><br>
                                                <span style="font-size: 11px; color: #64748B;"><i class="fa-solid fa-location-arrow"></i> ห่างออกไป ${(dist.distance).toFixed(1)} กม.</span>
                                            </div>
                                            <div style="text-align: right;">
                                                <span class="text-${type}" style="font-weight: 700; font-size: 15px;">AQI ${dist.aqi}</span><br>
                                                <span style="font-size: 11px; color: #94A3B8;">${getAqiTextTh(dist.aqi)}</span>
                                            </div>
                                        </li>
                                    `;
                                });
                            }

                            if(overlayLoc) overlayLoc.classList.add('fade-out');
                            if(listLoc) listLoc.classList.remove('hidden');
                            Swal.fire({ icon: 'success', title: 'ระบุตำแหน่งสำเร็จ', text: 'แสดงจุดที่อยู่ใกล้คุณที่สุดเรียบร้อย', timer: 1500, showConfirmButton: false });
                        },
                        (error) => {
                            newBtn.innerHTML = '<i class="fa-solid fa-check"></i> อนุญาตการเข้าถึง';
                            newBtn.disabled = false;
                            Swal.fire({ icon: 'error', title: 'ปฏิเสธการเข้าถึงพิกัด', text: 'กรุณาเปิดสิทธิ์ GPS เพื่อใช้งานฟีเจอร์นี้' });
                        }
                    );
                }
            });
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initNakhonMapSystem);
        } else {
            initNakhonMapSystem();
        }

        // แก้บัคแผนที่เทาตอนโหลดสลับหน้า (SPA Issue) - บังคับให้โหลดขนาดกล่องแผนที่ใหม่เมื่อผู้ใช้กดเปลี่ยนเมนู
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                setTimeout(() => {
                    if(window.myNakhonMapInstance) {
                        window.myNakhonMapInstance.invalidateSize();
                    }
                }, 300);
            });
        });
    })();