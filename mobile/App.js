import React, {useState, useEffect, useRef} from 'react'
// Simple in-app log buffer for debugging
const logBuffer = [];
function addLog(msg) {
  if (logBuffer.length > 20) logBuffer.shift();
  logBuffer.push(msg);
}
import { SafeAreaView, View, Text, Button, StyleSheet, TextInput, TouchableOpacity, Animated, Image, ImageBackground, ScrollView, RefreshControl, Modal, Platform } from 'react-native'
import Constants from 'expo-constants'
import * as WebBrowser from 'expo-web-browser'
import * as SplashScreen from 'expo-splash-screen'
import * as Linking from 'expo-linking'
import './src/i18n'
import { useTranslation } from 'react-i18next'
import api from './src/api'
import { saveToken, getToken, clearToken } from './src/auth'
import { startNotificationListening, stopNotificationListening, setupNotificationResponseHandler } from './src/notifications'
import MealPlanScreen from './src/MealPlanScreen'
import ProgressScreen from './src/ProgressScreen'
import MessagesScreen from './src/MessagesScreen'
import SupportScreen from './src/SupportScreen'
import AchievementsScreen from './src/AchievementsScreen'
import AppointmentsScreen from './src/AppointmentsScreen'
import RecipesScreen from './src/RecipesScreen'
import SettingsScreen from './src/SettingsScreen'
import GeminiChatScreen from './src/GeminiChatScreen'
import NutritionistSelectionScreen from './src/NutritionistSelectionScreen'
import NutritionistPatientsScreen from './src/nutritionist/PatientsScreen'
import NutritionistCalendarScreen from './src/nutritionist/CalendarScreen'
import NutritionistRecipesScreen from './src/nutritionist/RecipesScreen'
import NutritionistRecommendationsScreen from './src/nutritionist/RecommendationsScreen'
import NutritionistMealPlansScreen from './src/nutritionist/MealPlansScreen'

// Configura tu URL de backend
const BACKEND_URL = 'https://health-nutrition-control.onrender.com'

// Función para determinar la temporada actual
function getCurrentSeason() {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return 'spring';  // Primavera: Marzo-Mayo
  if (month >= 6 && month <= 8) return 'summer';  // Verano: Junio-Agosto
  if (month >= 9 && month <= 11) return 'fall';   // Otoño: Septiembre-Noviembre
  return 'winter';  // Invierno: Diciembre-Febrero
}

// Función para obtener imagen de comida saludable según la temporada
function getSeasonalFoodImage() {
  const season = getCurrentSeason();
  const seasonalFoods = {
    spring: 'spring-vegetables-asparagus-peas',
    summer: 'summer-berries-watermelon-salad',
    fall: 'autumn-pumpkin-squash-vegetables',
    winter: 'winter-citrus-oranges-vegetables'
  };
  
  // Usando Unsplash Source API para imágenes aleatorias de comida saludable según temporada
  const query = seasonalFoods[season];
  return `https://source.unsplash.com/800x400/?healthy-food,${query}`;
}

WebBrowser.maybeCompleteAuthSession();

// Evita que la pantalla de bienvenida se oculte automáticamente
SplashScreen.preventAutoHideAsync().catch(err => {
  console.warn('SplashScreen preventAutoHide failed:', err);
});

export default function App() {
  const { t, i18n } = useTranslation()
  const isExpoGo = Constants.appOwnership === 'expo'
  const isAndroid = Platform.OS === 'android'
  const skipNotifications = isExpoGo && isAndroid
  const [appIsReady, setAppIsReady] = useState(false);
  const [token, setToken] = useState(null)
  const [view, setView] = useState('home') // home | login | register | dashboard | mealplan | progress | achievements | recipes | appointments | messages | support | settings
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [profile, setProfile] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [todayMeals, setTodayMeals] = useState([])
  const [loadingMeals, setLoadingMeals] = useState(false)
    const [displayedDay, setDisplayedDay] = useState('')
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState(null)
  const drawerAnim = useRef(new Animated.Value(-260)).current
  const [imageError, setImageError] = useState(false)
  // home | login | register | dashboard | mealplan | progress | achievements | recipes | appointments | messages | support | settings | gemini

  const isNutritionist = profile?.role === 'nutritionist' || profile?.role === 'admin'
  
  // Store deeplink listener for cleanup
  const deeplinkListenerRef = useRef(null);
  const authHandledRef = useRef(false); // tracks if a login flow already completed

  const featureCards = [
    { icon: '📊', title: t('home_feature_progress'), desc: t('home_feature_progress_desc') },
    { icon: '📝', title: t('home_feature_ocr'), desc: t('home_feature_ocr_desc') },
    { icon: '🍱', title: t('home_feature_mealplan'), desc: t('home_feature_mealplan_desc') },
    { icon: '💬', title: t('home_feature_support'), desc: t('home_feature_support_desc') },
  ]

  const steps = [
    { label: '1', title: t('home_step1_title'), desc: t('home_step1_desc') },
    { label: '2', title: t('home_step2_title'), desc: t('home_step2_desc') },
    { label: '3', title: t('home_step3_title'), desc: t('home_step3_desc') },
  ]

  const highlights = []

  // --- Google Auth: Usar callback directo del backend ---
  async function handleGoogleLogin() {
    authHandledRef.current = false;
    try {
      // Crear el redirect URL que el backend debe usar
      const redirectUrl = Linking.createURL('oauth-callback');
      
      // Construir la URL de auth con el redirect_uri como parámetro
      const authUrl = `${BACKEND_URL}/api/auth/google?redirect_uri=${encodeURIComponent(redirectUrl)}`;
      
      console.log('Auth URL:', authUrl);
      console.log('Redirect URL:', redirectUrl);
      console.log('Opening browser for OAuth...');
      
      // Abrir el navegador para OAuth
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl, 
        redirectUrl
      );
      
      console.log('openAuthSessionAsync result:', result.type);
      
      // If the browser was dismissed (user closed manually or system closed it)
      if (result.type === 'dismiss' || result.type === 'cancel') {
        console.log('Browser was dismissed, checking if auth completed...');
        
        // Wait a bit for deep link to process
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if we got a token from the deep link
        const existingToken = await getToken();
        if (existingToken) {
          console.log('Token found after browser dismissal - auth succeeded');
          return;
        } else {
          console.log('No token found - user cancelled auth');
          return;
        }
      }

      console.log('Navegador cerrado, handleDeepLink debería procesar el token...');

      if (authHandledRef.current) {
        console.log('Deep link already processed during auth session; skipping fallback.');
        return;
      }

      const existingToken = await getToken();
      if (existingToken) {
        console.log('Token already present after auth session; skipping fallback.');
        authHandledRef.current = true;
        return;
      }

      console.log('Browser closed, polling backend for token...');
      const token = await pollForToken();
      
      if (token) {
        authHandledRef.current = true;
        await completeLogin(token, '¡Bienvenido con Google!');
      } else {
        console.log('No token from backend, will wait for deep link...');
      }
      
    } catch (e) {
      console.warn('Google login error:', e);
      alert('Error en login: ' + (e?.message || 'Desconocido')); 
    }
  }

  function extractAccessToken(url) {
    try {
      console.log('Extracting token from URL:', url);
      
      // Try to parse as URL
      try {
        const urlObj = new URL(url);
        
        // Intentar obtener de hash (#token=...)
        const hash = url.split('#')[1];
        if (hash) {
          console.log('Hash found:', hash);
          const params = new URLSearchParams(hash);
          const token = params.get('access_token') || params.get('token');
          if (token) {
            console.log('Token found in hash');
            return token;
          }
        }
        
        // Intentar obtener de query params (?token=...)
        const token = urlObj.searchParams.get('token') || urlObj.searchParams.get('access_token');
        if (token) {
          console.log('Token found in query params');
          return token;
        }
        
        console.log('No token found in parsed URL');
        console.log('URL params:', Array.from(urlObj.searchParams.entries()));
      } catch (parseErr) {
        console.log('Could not parse as URL, trying string split:', parseErr.message);
        
        // Fallback: try manual parsing
        if (url.includes('?token=')) {
          const match = url.match(/[?&]token=([^&]*)/);
          if (match && match[1]) {
            const token = decodeURIComponent(match[1]);
            console.log('Token found in query string (regex)');
            return token;
          }
        }
      }
      
      console.log('No token found in URL');
      return null;
    } catch (err) {
      console.warn('Error parsing token from url', url, err);
      return null;
    }
  }

  async function completeLogin(token, welcomeMessage = '¡Bienvenido!') {
    console.log('Finalizing login with token length:', token?.length);
    await saveToken(token);
    setToken(token);
    setEmail('');
    setPassword('');

    try {
      console.log('Fetching profile...');
      await fetchProfile(token);
      console.log('Profile fetched successfully');
      setView('dashboard');
    } catch (e) {
      console.warn('Profile fetch failed:', e);
      setView('dashboard');
    }
  }

  // Handle deep link from OAuth callback
  async function handleDeepLink(event) {
    console.log('=== HANDLE DEEP LINK TRIGGERED ===');
    console.log('Deep link received:', event.url);
    const url = event.url;
    
    // Check for token in URL FIRST
    const token = extractAccessToken(url);
    console.log('Token extraction result:', token ? 'FOUND' : 'NOT FOUND');
    
    if (token) {
      authHandledRef.current = true;
      console.log('Token extracted from deep link, length:', token.length);
      
      // Close the browser immediately after getting the token
      setTimeout(() => {
        try {
          WebBrowser.dismissBrowser();
        } catch (e) {
          console.log('Browser already closed');
        }
      }, 100);
      
      await completeLogin(token, '¡Bienvenido con Google!');
    } else {
      console.log('No token found in deep link URL, checking AsyncStorage...');
      // Try to get token from storage (in case it was saved elsewhere)
      const storedToken = await getToken();
      if (storedToken) {
        console.log('Found token in storage from previous save');
        authHandledRef.current = true;
        await completeLogin(storedToken, '¡Bienvenido con Google!');
      } else {
        console.log('No token found anywhere, staying on login');
      }
    }
  }

  useEffect(() => {
    async function prepare() {
      try {
        console.log('App initializing...');
        setAppIsReady(true); // Set ready FIRST to show something
        
        const tk = await getToken();
        if (tk) {
          console.log('Token found, setting...');
          setToken(tk);
          // Start listening for notifications (skip in Expo Go on Android)
          if (!skipNotifications) {
            await startNotificationListening();
          } else {
            console.log('Skipping notification listener (Expo Go on Android)');
          }
          // Fetch profile in background, don't wait
          fetchProfile(tk).catch(e => console.warn('Profile fetch failed:', e));
        }
        
        // Check for initial URL from cold start
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl != null) {
          console.log('Initial URL from cold start:', initialUrl);
          const token = extractAccessToken(initialUrl);
          if (token) {
            await saveToken(token);
            setToken(token);
            setView('dashboard');
            if (!skipNotifications) {
              await startNotificationListening();
            } else {
              console.log('Skipping notification listener (Expo Go on Android)');
            }
            fetchProfile(token).catch(e => console.warn('Profile fetch failed:', e));
          }
        }
        
        // Hide splash screen with error handling
        setTimeout(() => {
          SplashScreen.hideAsync().catch(err => {
            console.warn('Hide splash failed:', err);
          });
        }, 100);
      } catch (e) {
        console.warn('Prepare error:', e);
        setAppIsReady(true); // Still show app even if error
      }
    }

    prepare();
    
    const subscription = Linking.addEventListener('url', handleDeepLink);
    deeplinkListenerRef.current = subscription;

    // Setup notification response handler
    const unsubscribeNotificationResponse = setupNotificationResponseHandler((data) => {
      console.log('[App] Notification tapped:', data);
      if (data.type === 'message') {
        // Navegar a la pantalla de mensajes
        // La lista de conversaciones mostrará unread_count para guiar al usuario
        setView('messages');
      }
    });
    
    return () => {
      if (deeplinkListenerRef.current) {
        deeplinkListenerRef.current.remove();
      }
      if (typeof unsubscribeNotificationResponse === 'function') {
        unsubscribeNotificationResponse();
      }
    };
  }, []);

  async function fetchProfile(tk){
    try{
      console.log('fetchProfile: Making API call to /me with token:', tk.substring(0, 20) + '...');
      const res = await api.get('/me',{ headers: { Authorization: `Bearer ${tk}` } })
      console.log('fetchProfile: Response received:', res.data);

      // Ensure nutritionist fields exist so messaging can prioritize the assigned nutritionist
      const enhancedProfile = {
        ...res.data,
        nutritionist_id: res.data?.nutritionist_id ?? null,
        nutritionist_name: res.data?.nutritionist_name ?? (res.data?.nutritionist_id ? 'Mi nutriólogo' : null),
      };

        setProfile(enhancedProfile)

        // Send nutritionists to their stack by default
        if ((res.data?.role === 'nutritionist' || res.data?.role === 'admin')) {
          setView(prev => (prev === 'dashboard' || prev === 'home') ? 'nutri-patients' : prev)
        }

        // Load today's meals after profile is loaded
        await loadTodayMeals(tk);
        // Load upcoming appointments summary
        await loadUpcomingAppointments(tk);
    }catch(e){ 
      console.warn('fetchProfile: Error -', e.message, e.response?.status, e.response?.data);
      throw e;
    }
  }

  async function loadTodayMeals(tk) {
    try {
      setLoadingMeals(true);
      const today = new Date();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const spanishDays = {
        'Sunday': 'Domingo',
        'Monday': 'Lunes',
        'Tuesday': 'Martes',
        'Wednesday': 'Miércoles',
        'Thursday': 'Jueves',
        'Friday': 'Viernes',
        'Saturday': 'Sábado'
      };
      const dayName = dayNames[today.getDay()];
      const spanishDayName = spanishDays[dayName];
      
      console.log('[LoadTodayMeals] Loading meals for day:', spanishDayName);
      
      const response = await api.get('/meal-plan', {
        headers: { Authorization: `Bearer ${tk}` }
      });
      
      const { meals } = response.data;
      
      // Filter meals for today
      let todaysMeals = meals.filter(m => m.day_of_week === spanishDayName);
      let effectiveDay = spanishDayName;

      // Fallback: if today has no meals (e.g., Sunday not in plan), show the most recent available day
      if (todaysMeals.length === 0 && meals.length > 0) {
        const preferredFallback = spanishDayName === 'Domingo' ? 'Sábado' : null;
        const candidateDay = preferredFallback && meals.some(m => m.day_of_week === preferredFallback)
          ? preferredFallback
          : meals[0].day_of_week;
        todaysMeals = meals.filter(m => m.day_of_week === candidateDay);
        effectiveDay = candidateDay;
        console.log('[LoadTodayMeals] No meals for today, falling back to', candidateDay);
      }
      
      console.log('[LoadTodayMeals] Found', todaysMeals.length, 'meals for day', effectiveDay);
      setTodayMeals(todaysMeals);
      setDisplayedDay(effectiveDay);
    } catch (error) {
      console.warn('[LoadTodayMeals] Error:', error.message);
      setTodayMeals([]);
      setDisplayedDay('');
    } finally {
      setLoadingMeals(false);
    }
  }

  async function loadUpcomingAppointments(tk) {
    try {
      setLoadingAppointments(true);
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
      const res = await api.get(`/appointments`, {
        headers: { Authorization: `Bearer ${tk}` }
      });
      const list = Array.isArray(res.data) ? res.data : [];
      console.log('[Appointments] API returned', list.length, 'records');
      console.log('[Appointments] todayStr:', todayStr);
      
      // Only today or future, compare by date string to avoid TZ shift issues
      const upcoming = list
        .filter(a => {
          const d = (a.appointment_date || '').slice(0,10);
          const passes = d && d >= todayStr;
          console.log('[Appointments] Checking:', a.title, '| date:', d, '| passes:', passes);
          return passes;
        })
        .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date))
        .slice(0, 2); // show next 2
      setUpcomingAppointments(upcoming);
      console.log('[Appointments] Loaded', upcoming.length, 'upcoming appointments');
    } catch (error) {
      console.warn('[Appointments] Error:', error.message);
      setUpcomingAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  }


  async function refreshProfile() {
    if (!token) return;
    try {
      await fetchProfile(token);
    } catch (e) {
      console.warn('refreshProfile: unable to refresh profile', e?.message || e);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
      if (token) {
        await loadTodayMeals(token);
        await loadUpcomingAppointments(token);
      }
    } catch (e) {
      console.warn('onRefresh error:', e?.message || e);
    } finally {
      setRefreshing(false);
    }
  }

  async function pollForToken(maxAttempts = 10) {
    console.log('Polling backend for token...');
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await api.get('/auth/last-token');
        if (response.data && response.data.token) {
          console.log('Token found! Attempt:', i + 1);
          return response.data.token;
        }
      } catch (e) {
        // Token not ready yet, continue polling
        console.log('Poll attempt', i + 1, '- no token yet');
      }
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log('No token found after', maxAttempts, 'attempts');
    return null;
  }

  async function handleLogin() {
    try {
      const res = await api.post('/login', { email, password });
      const tk = res.data.token;
      await completeLogin(tk, '¡Bienvenido!');
    } catch (e) {
      if (e.response?.status === 401) {
        alert('Credenciales incorrectas');
      } else {
        alert('Error al iniciar sesión');
      }
    }
  }

  async function handleRegister(){
    try{
      await api.post('/register',{ name, email, password })
      alert('Cuenta creada, ahora inicia sesión')
      setName('')
      setEmail('')
      setPassword('')
      setView('login')
    }catch(e){
      if(e.response?.status === 409){
        alert('El correo ya está registrado')
      }else{
        alert('Error al registrar')
      }
    }
  }

  async function handleLogout(){
    stopNotificationListening();
    await clearToken()
    setToken(null)
    setProfile(null)
    setDrawerOpen(false)
    setView('home')
  }

  function openDrawer() {
    setDrawerOpen(true)
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }

  function closeDrawer() {
    Animated.timing(drawerAnim, {
      toValue: -260,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setDrawerOpen(false)
    })
  }

  function toggleDrawer() {
    if (drawerOpen) {
      closeDrawer()
    } else {
      openDrawer()
    }
  }

  // Normalize navigation targets so screens that call 'home' come back to dashboard
  function navigate(nextView) {
    const target = nextView === 'home' ? 'dashboard' : nextView
    setView(target)
    setDrawerOpen(false)
  }

  // Guard: wait for app to be ready before rendering
  if (!appIsReady) {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#4CAF50'}}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20}}>
          <Text style={{color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 10}}>Control de Salud</Text>
          <Text style={{color: '#fff', fontSize: 16}}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderContent = () => {
    try {
      if (view === 'login') {
        return (
          <View style={{flex: 1, justifyContent: 'center', padding: 20}}>
            <Text style={styles.formTitle}>Iniciar Sesión</Text>
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            <Button title="Login" onPress={handleLogin} />
            <View style={{marginVertical: 20}}>
              <Text style={{textAlign: 'center', color: '#666', marginBottom: 10}}>O inicia sesión con:</Text>
              <TouchableOpacity 
                style={{
                  backgroundColor: '#fff', 
                  padding: 12, 
                  borderRadius: 8, 
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#dadce0',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2
                }}
                onPress={handleGoogleLogin}
              >
                <View style={{marginRight: 12, backgroundColor: '#fff', borderRadius: 2}}>
                  <Text style={{fontSize: 18, fontWeight: '700', color: '#4285F4'}}>G</Text>
                </View>
                <Text style={{fontSize: 16, fontWeight: '500', color: '#3c4043'}}>Continuar con Google</Text>
              </TouchableOpacity>
            </View>
            <Button title="Volver" onPress={() => setView('home')} />
          </View>
        );
      }
      if (view === 'register') {
        return (
          <View style={{flex: 1, justifyContent: 'center', padding: 20}}>
            <Text style={styles.formTitle}>Registrarse</Text>
            <TextInput style={styles.input} placeholder="Nombre" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            <Button title="Register" onPress={handleRegister} />
            <Button title="Volver" onPress={() => setView('home')} />
          </View>
        );
      }

        if (view === 'dashboard') {
          if (isNutritionist) {
            return (
              <View style={{flex: 1, backgroundColor: '#f5f7fa'}}>
                <View style={styles.dashboardHeaderBar}>
                  <TouchableOpacity onPress={() => navigate('nutri-patients')} style={styles.menuButton}>
                    <Text style={styles.menuIcon}>👥</Text>
                  </TouchableOpacity>
                  <Text style={styles.dashboardTitle}>Panel Nutrióloga</Text>
                  <TouchableOpacity style={styles.logoutBadge} onPress={handleLogout}>
                    <Text style={styles.logoutBadgeText}>Salir</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={{flex: 1}}
                  contentContainerStyle={{padding: 16, paddingBottom: 24, flexGrow: 1}}
                  alwaysBounceVertical
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      tintColor="#3b82f6"
                      colors={['#3b82f6']}
                    />
                  }
                >
                  <View style={styles.dashboardHeader}>
                    <View>
                      <Text style={styles.dashboardGreeting}>Hola, {profile?.name || 'Profesional'}</Text>
                      <Text style={styles.dashboardSub}>Gestiona pacientes, citas y recetas</Text>
                    </View>
                  </View>

                  <View style={styles.dashboardCard}>
                    <Text style={styles.cardTitle}>Acciones rápidas</Text>
                    <View style={styles.quickActions}>
                      <TouchableOpacity style={styles.quickAction} onPress={() => navigate('nutri-patients')}>
                        <Text style={styles.quickActionText}>👥 Pacientes</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.quickAction} onPress={() => navigate('nutri-calendar')}>
                        <Text style={styles.quickActionText}>📅 Citas</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.quickAction} onPress={() => navigate('nutri-recipes')}>
                        <Text style={styles.quickActionText}>📖 Recetas</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.quickAction} onPress={() => navigate('nutri-recommendations')}>
                        <Text style={styles.quickActionText}>📋 Recomendaciones</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.quickAction} onPress={() => navigate('nutri-meal-plans')}>
                        <Text style={styles.quickActionText}>🍱 Planes</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.quickAction} onPress={() => navigate('messages')}>
                        <Text style={styles.quickActionText}>💬 Mensajes</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.dashboardCard}>
                    <Text style={styles.cardTitle}>Sugerencia</Text>
                    <Text style={styles.placeholderText}>Consulta pacientes, agenda y mensajes desde este panel dedicado para nutriólogas.</Text>
                  </View>

                  <TouchableOpacity style={[styles.navButton, {marginTop: 12}]} onPress={() => setView('home')}>
                    <Text style={styles.navButtonText}>Volver al inicio</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            );
          }

          return (
            <View style={{flex: 1, backgroundColor: '#f5f7fa'}}>
              <View style={styles.dashboardHeaderBar}>
                <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
                  <Text style={styles.menuIcon}>☰</Text>
                </TouchableOpacity>
                <Text style={styles.dashboardTitle}>Dashboard</Text>
                <TouchableOpacity style={styles.logoutBadge} onPress={handleLogout}>
                  <Text style={styles.logoutBadgeText}>Salir</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={{flex: 1}}
                contentContainerStyle={{padding: 16, paddingBottom: 24, flexGrow: 1}}
                alwaysBounceVertical
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#3b82f6"
                    colors={['#3b82f6']}
                  />
                }
              >
                <View style={styles.dashboardHeader}>
                  <View>
                    <Text style={styles.dashboardGreeting}>Hola, {profile?.name || 'Usuario'}</Text>
                    <Text style={styles.dashboardSub}>Tu espacio personal de bienestar</Text>
                  </View>
                </View>

                {!profile?.nutritionist_id && (
                  <View style={styles.notificationBanner}>
                    <Text style={styles.notificationTitle}>👨‍⚕️ ¿No tienes nutriólogo?</Text>
                    <Text style={styles.notificationText}>
                      Asigna uno para que te acompañe en tu camino hacia el bienestar
                    </Text>
                    <TouchableOpacity style={styles.notificationButton} onPress={() => setView('nutritionist-selection')}>
                      <Text style={styles.notificationButtonText}>Elegir nutriólogo</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {profile?.nutritionist_id && (
                  <View style={[styles.dashboardCard, styles.nutritionistCard]}>
                    <View style={styles.nutritionistHeader}>
                      <Text style={styles.nutritionistIcon}>👨‍⚕️</Text>
                      <View style={{flex: 1}}>
                        <Text style={styles.nutritionistLabel}>Tu nutriólogo</Text>
                        <Text style={styles.nutritionistName}>{profile?.nutritionist_name || 'Nutriólogo asignado'}</Text>
                      </View>
                    </View>
                    {profile?.nutritionist_email && (
                      <View style={styles.nutritionistContact}>
                        <Text style={styles.nutritionistContactLabel}>📧 {profile.nutritionist_email}</Text>
                      </View>
                    )}
                    <TouchableOpacity style={styles.changeNutritionistButton} onPress={() => setView('nutritionist-selection')}>
                      <Text style={styles.changeNutritionistText}>Cambiar nutriólogo</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.dashboardCard}>
                  <Text style={styles.cardTitle}>Resumen rápido</Text>
                  <View style={styles.metricRow}>
                    <View style={styles.metricCard}>
                      <Text style={styles.metricLabel}>Próxima comida</Text>
                      <Text style={styles.metricValue}>{profile?.meal_times?.lunch || '14:00'}</Text>
                      <Text style={styles.metricSub}>Plan diario</Text>
                    </View>
                    <View style={styles.metricCard}>
                      <Text style={styles.metricLabel}>Recordatorios</Text>
                      <Text style={styles.metricValue}>{profile?.enable_reminders === false ? 'Inactivos' : 'Activos'}</Text>
                      <Text style={styles.metricSub}>Notificaciones</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.dashboardCard}>
                  <Text style={styles.cardTitle}>Atajos</Text>
                  <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.quickAction} onPress={() => navigate('mealplan')}>
                      <Text style={styles.quickActionText}>Plan de comidas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction} onPress={() => navigate('progress')}>
                      <Text style={styles.quickActionText}>Progreso</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction} onPress={() => navigate('messages')}>
                      <Text style={styles.quickActionText}>Mensajes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction} onPress={() => navigate('support')}>
                      <Text style={styles.quickActionText}>Soporte</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.dashboardCard}>
                  <Text style={styles.cardTitle}>Próximas citas</Text>
                  {loadingAppointments ? (
                    <Text style={styles.placeholderText}>Cargando citas...</Text>
                  ) : upcomingAppointments.length === 0 ? (
                    <View>
                      <Text style={styles.placeholderText}>Aún no tienes citas programadas.</Text>
                      <TouchableOpacity style={[styles.quickAction, {marginTop: 8}]} onPress={() => navigate('appointments')}>
                        <Text style={styles.quickActionText}>Ir a Citas</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View>
                      {upcomingAppointments.map((appt, idx) => (
                        <View key={idx} style={{marginVertical: 6, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb'}}>
                          <Text style={{fontSize: 14, fontWeight: '600', color: '#374151'}}>
                            {appt.title || 'Cita'}
                          </Text>
                          <Text style={{fontSize: 12, color: '#6b7280', marginTop: 2}}>
                            📅 {new Date(appt.appointment_date).toLocaleDateString('es-ES')}{appt.appointment_time ? ` · 🕒 ${appt.appointment_time}` : ''}
                          </Text>
                          {appt.description && (
                            <Text style={{fontSize: 12, color: '#9ca3af', marginTop: 2}} numberOfLines={2}>
                              {appt.description}
                            </Text>
                          )}
                        </View>
                      ))}
                      <TouchableOpacity style={[styles.quickAction, {marginTop: 8}]} onPress={() => navigate('appointments')}>
                        <Text style={styles.quickActionText}>Ver todas</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <View style={styles.dashboardCard}>
                  <Text style={styles.cardTitle}>Plan de hoy</Text>
                  {displayedDay && (
                    <Text style={{fontSize: 12, color: '#6b7280', marginTop: 4}}>
                      Mostrando plan para {displayedDay}
                    </Text>
                  )}
                  {loadingMeals ? (
                    <Text style={styles.placeholderText}>Cargando plan del día...</Text>
                  ) : todayMeals.length === 0 ? (
                    <Text style={styles.placeholderText}>No tienes comidas programadas para hoy.</Text>
                  ) : (
                    <View>
                      {todayMeals.map((meal, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginVertical: 8,
                            paddingVertical: 12,
                            paddingHorizontal: 12,
                            backgroundColor: '#f9fafb',
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: '#e5e7eb'
                          }}
                          onPress={() => setSelectedMeal(meal)}
                        >
                          <View style={{flex: 1}}>
                            <Text style={{fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4}}>
                              {meal.meal_type}
                            </Text>
                            <Text style={{fontSize: 13, color: '#1f2937'}}>
                              {meal.name}
                            </Text>
                          </View>
                          <Text style={{fontSize: 18, color: '#3b82f6', marginLeft: 8}}>→</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <TouchableOpacity style={[styles.navButton, {marginTop: 12}]} onPress={() => setView('home')}>
                  <Text style={styles.navButtonText}>Volver al inicio</Text>
                </TouchableOpacity>
              </ScrollView>

              {drawerOpen && (
                <View style={styles.drawerOverlay}>
                  <TouchableOpacity style={styles.drawerBackdrop} onPress={closeDrawer} />
                  <Animated.View style={[styles.drawerPane, { transform: [{ translateX: drawerAnim }] }]}>
                    <Text style={styles.drawerTitle}>Menú</Text>
                    <TouchableOpacity style={styles.drawerItem} onPress={() => navigate('dashboard')}>
                      <Text style={styles.drawerItemText}>Dashboard</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.drawerItem} onPress={() => navigate('mealplan')}>
                      <Text style={styles.drawerItemText}>Plan de comidas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.drawerItem} onPress={() => navigate('appointments')}>
                      <Text style={styles.drawerItemText}>Citas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.drawerItem} onPress={() => navigate('progress')}>
                      <Text style={styles.drawerItemText}>Progreso</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.drawerItem} onPress={() => navigate('messages')}>
                      <Text style={styles.drawerItemText}>Mensajes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.drawerItem} onPress={() => navigate('support')}>
                      <Text style={styles.drawerItemText}>Soporte</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.drawerItem} onPress={handleLogout}>
                      <Text style={[styles.drawerItemText, {color: '#ef4444'}]}>Cerrar sesión</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              )}

              {/* Modal de detalle de comida */}
              <Modal
                visible={selectedMeal !== null}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setSelectedMeal(null)}
              >
                <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'}}>
                  <View style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    padding: 24,
                    width: '90%',
                    maxHeight: '80%',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8
                  }}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
                      <Text style={{fontSize: 20, fontWeight: 'bold', color: '#1f2937', flex: 1}}>
                        🍽️ {selectedMeal?.name}
                      </Text>
                      <TouchableOpacity onPress={() => setSelectedMeal(null)}>
                        <Text style={{fontSize: 24, color: '#6b7280'}}>✕</Text>
                      </TouchableOpacity>
                    </View>

                    <ScrollView style={{maxHeight: 400}}>
                      {selectedMeal?.description && (
                        <View style={{marginBottom: 16}}>
                          <Text style={{fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8}}>
                            📝 Descripción
                          </Text>
                          <Text style={{fontSize: 14, color: '#6b7280', lineHeight: 20}}>
                            {selectedMeal.description}
                          </Text>
                        </View>
                      )}

                      {selectedMeal?.ingredients && (
                        <View style={{marginBottom: 16}}>
                          <Text style={{fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8}}>
                            🥗 Ingredientes
                          </Text>
                          <Text style={{fontSize: 14, color: '#6b7280', lineHeight: 20}}>
                            {selectedMeal.ingredients}
                          </Text>
                        </View>
                      )}

                      {selectedMeal?.preparation && (
                        <View style={{marginBottom: 16}}>
                          <Text style={{fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8}}>
                            👨‍🍳 Preparación
                          </Text>
                          <Text style={{fontSize: 14, color: '#6b7280', lineHeight: 20}}>
                            {selectedMeal.preparation}
                          </Text>
                        </View>
                      )}

                      {selectedMeal?.calories && (
                        <View style={{marginBottom: 16}}>
                          <Text style={{fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8}}>
                            📊 Información Nutricional
                          </Text>
                          <Text style={{fontSize: 14, color: '#6b7280'}}>
                            🔥 Calorías: {selectedMeal.calories}
                          </Text>
                        </View>
                      )}
                    </ScrollView>

                    <TouchableOpacity
                      style={{
                        backgroundColor: '#3b82f6',
                        paddingVertical: 12,
                        paddingHorizontal: 24,
                        borderRadius: 8,
                        alignItems: 'center',
                        marginTop: 16
                      }}
                      onPress={() => setSelectedMeal(null)}
                    >
                      <Text style={{color: 'white', fontSize: 16, fontWeight: '600'}}>
                        Cerrar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
          );
        }

        if (view === 'nutri-patients') {
          return <NutritionistPatientsScreen onNavigate={navigate} />
        }

        if (view === 'nutri-calendar') {
          return <NutritionistCalendarScreen onNavigate={navigate} />
        }

        if (view === 'nutri-recipes') {
          return <NutritionistRecipesScreen onNavigate={navigate} />
        }

        if (view === 'nutri-recommendations') {
          return <NutritionistRecommendationsScreen onNavigate={navigate} />
        }

        if (view === 'nutri-meal-plans') {
          return <NutritionistMealPlansScreen onNavigate={navigate} />
        }

      if (view === 'mealplan') {
        return <MealPlanScreen onNavigate={navigate} />
      }

      if (view === 'progress') {
        return <ProgressScreen onNavigate={navigate} />
      }

      if (view === 'messages') {
        return <MessagesScreen onNavigate={navigate} profile={profile} />
      }

      if (view === 'support') {
        return <SupportScreen onNavigate={navigate} />
      }

      if (view === 'appointments') {
        return <AppointmentsScreen onNavigate={navigate} />
      }

      if (view === 'recipes') {
        return <RecipesScreen onNavigate={navigate} />
      }

      if (view === 'achievements') {
        return <AchievementsScreen onNavigate={navigate} />
      }

      if (view === 'settings') {
        return <SettingsScreen onNavigate={navigate} onLogout={handleLogout} onRefreshProfile={refreshProfile} profile={profile} />
      }

      if (view === 'nutritionist-selection') {
        return <NutritionistSelectionScreen onNavigate={navigate} onAssigned={refreshProfile} />
      }

      if (view === 'gemini') {
        return <GeminiChatScreen onNavigate={navigate} profile={profile} />
      }
      
      return (
        <ImageBackground 
          source={{ uri: getSeasonalFoodImage() }}
          style={{flex: 1}}
          resizeMode="cover"
          onError={(e) => {
            console.log('Background image failed to load:', e.nativeEvent.error);
            setImageError(true);
          }}
        >
          {/* Overlay oscuro para mejorar la legibilidad */}
          <View style={{
            flex: 1,
            backgroundColor: imageError ? 'rgba(45, 80, 22, 0.85)' : 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}>
            {imageError && (
              <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-evenly', alignItems: 'center', opacity: 0.15}}>
                <Text style={{fontSize: 80}}>🥗</Text>
                <Text style={{fontSize: 80}}>🍎</Text>
                <Text style={{fontSize: 80}}>🥑</Text>
                <Text style={{fontSize: 80}}>🥕</Text>
                <Text style={{fontSize: 80}}>🍊</Text>
              </View>
            )}
            
            <Text style={{fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 15, textShadowColor: 'rgba(0, 0, 0, 0.8)', textShadowOffset: {width: 2, height: 2}, textShadowRadius: 5}}>BienestarApp</Text>
            <Text style={{fontSize: 18, color: '#fff', marginBottom: 50, textShadowColor: 'rgba(0, 0, 0, 0.8)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 3}}>Tu salud, nuestra prioridad</Text>
            
            <TouchableOpacity 
              style={{backgroundColor: '#4CAF50', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 10, marginBottom: 15, width: '85%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5, elevation: 5}}
              onPress={()=>setView('login')}
            >
              <Text style={{color: '#fff', fontSize: 18, fontWeight: '700'}}>Iniciar Sesión</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 10, borderWidth: 2, borderColor: '#fff', width: '85%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5, elevation: 5}}
              onPress={()=>setView('register')}
            >
              <Text style={{color: '#2d5016', fontSize: 18, fontWeight: '700'}}>Registrarse</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      );
    } catch (err) {
      console.error('renderContent error:', err);
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20}}>
          <Text style={{color: '#f00', fontSize: 14}}>Error: {err.message}</Text>
        </View>
      );
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={{fontSize: 20, fontWeight: 'bold', color: '#1e88e5'}}>BIENESTAR</Text>
      </View>
      {renderContent()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f7fa' 
  },
  header: { 
    flexDirection: 'row', 
    padding: 12, 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#fff',
    height: 70,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  logo: { 
    width: 120, 
    height: 35, 
    resizeMode: 'contain' 
  },
  lang: { 
    flexDirection: 'row', 
    width: 100, 
    justifyContent: 'space-between' 
  },
  main: { 
    alignItems: 'center', 
    justifyContent: 'flex-start', 
    paddingTop: 20,
    paddingBottom: 40
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 12, 
    backgroundColor: '#fff',
    fontSize: 16
  },

  heroSection: {
    width: '100%',
    height: 500,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#2d5016',
  },
  heroImageStyle: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '85%',
    maxWidth: 280,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '85%',
    maxWidth: 280,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  googleButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4285F4',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButtonText: {
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 320,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e88e5',
    marginBottom: 20,
    textAlign: 'center',
  },
  dailyTip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 16,
    marginTop: 20,
    width: '90%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  tipContent: {
    fontSize: 13,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 20,
  },
  authActions: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
    gap: 12,
  },
  heroWrap: {
    width: '100%',
    alignItems: 'center',
  },
  heroBadge: {
    backgroundColor: 'rgba(30, 58, 138, 0.9)',
    color: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    fontWeight: '700',
    marginBottom: 12,
    fontSize: 12,
  },
  highlightGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 14,
  },
  highlightPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 12,
    minWidth: 130,
    maxWidth: 170,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    margin: 6,
  },
  highlightBadge: {
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    fontSize: 14,
  },
  highlightText: {
    color: '#fff',
    fontSize: 12,
  },
  featureGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    width: '46%',
    minWidth: 150,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    margin: 5,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureTitle: {
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 4,
    color: '#111827',
  },
  featureDesc: {
    color: '#4b5563',
    fontSize: 13,
    lineHeight: 18,
  },
  stepsCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  stepsHeader: {
    marginBottom: 10,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  stepsSubtitle: {
    color: '#4b5563',
    marginTop: 2,
  },
  stepsGrid: {
    flexDirection: 'column',
    marginTop: 6,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    backgroundColor: '#f8fafc',
    marginBottom: 8,
  },
  stepLabel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: {
    fontWeight: '700',
    color: '#111827',
  },
  stepDesc: {
    color: '#4b5563',
    fontSize: 13,
    marginTop: 2,
  },
  linkText: {
    color: '#1e88e5',
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  loggedHome: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  profileLine: {
    color: '#4b5563',
    marginBottom: 6,
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  navButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    margin: 4,
  },
  navButtonText: {
    color: '#111827',
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#ef4444',
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
  },
  // Dashboard styles
  dashboardHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  menuIcon: {
    fontSize: 18,
    color: '#0f172a',
  },
  dashboardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dashboardGreeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  dashboardSub: {
    color: '#475569',
    marginTop: 4,
  },
  logoutBadge: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  logoutBadgeText: {
    color: '#fff',
    fontWeight: '700',
  },
  notificationBanner: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 6,
  },
  notificationText: {
    fontSize: 14,
    color: '#1e3a8a',
    marginBottom: 12,
    lineHeight: 20,
  },
  notificationButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  notificationButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  nutritionistCard: {
    backgroundColor: '#f8fafc',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  nutritionistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  nutritionistIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  nutritionistLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  nutritionistName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  nutritionistContact: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
    marginBottom: 12,
  },
  nutritionistContactLabel: {
    fontSize: 13,
    color: '#065f46',
    fontWeight: '500',
  },
  changeNutritionistButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  changeNutritionistText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  dashboardCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  metricLabel: {
    color: '#475569',
    fontSize: 12,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  metricSub: {
    color: '#94a3b8',
    marginTop: 4,
    fontSize: 12,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickAction: {
    backgroundColor: '#e0f2fe',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  quickActionText: {
    color: '#0369a1',
    fontWeight: '700',
  },
  placeholderText: {
    color: '#475569',
    lineHeight: 20,
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  drawerPane: {
    width: 260,
    backgroundColor: '#fff',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#0f172a',
  },
  drawerItem: {
    paddingVertical: 10,
  },
  drawerItemText: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '600',
  },
})