// Analytics - Telemetry Stubs
// Placeholder for GA4/Mixpanel integration

type EventName =
  | 'app_open'
  | 'login_success'
  | 'login_fail'
  | 'notice_impression'
  | 'notice_open'
  | 'notice_marked_read'
  | 'notice_marked_unread'
  | 'agenda_view'
  | 'agenda_event_open'
  | 'push_toggle'
  | 'password_changed'
  | 'attachment_download'
  | 'materials_page_view'
  | 'materials_loaded'
  | 'material_download_start'
  | 'material_download_success'
  | 'material_download_error'
  | 'material_view'
  | 'materials_filters_cleared'
  | 'boletim_download'
  | 'boletim_download_success'
  | 'boletim_download_error'
  | 'boletim_view'
  | 'push_registered'
  | 'push_registration_failed'
  | 'push_registration_error'
  | 'push_received_foreground'
  | 'push_action_performed'
  | 'push_permission_granted'
  | 'push_permission_denied'
  | 'attachment_view'
  | 'push_unregistered';

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track analytics event
 * TODO: Integrate with actual analytics provider (GA4, Mixpanel, etc.)
 */
export function trackEvent(eventName: EventName, properties?: EventProperties): void {
  if (process.env.DEV) {
    // console.log('[Analytics]', eventName, properties);
  }
  
  // TODO: Send to analytics provider
  // Example: gtag('event', eventName, properties);
  // Example: mixpanel.track(eventName, properties);
}

/**
 * Track page view
 */
export function trackPageView(pageName: string): void {
  trackEvent('app_open', { page: pageName, timestamp: Date.now() });
}