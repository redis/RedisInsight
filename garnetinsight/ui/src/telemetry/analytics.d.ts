declare global {
  interface Window {
    // Segment global analytics object, assigned in loadSegmentAnalytics().
    analytics: SegmentAnalytics.AnalyticsJS
  }
}
