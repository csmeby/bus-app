import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { reportCrash } from '@/lib/error-logging';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

// Catches render-time errors that would otherwise just show the in-app
// red-screen with no clean record — logs the full error + component stack to
// the console (visible in the Metro/Expo terminal) and reports it to the
// server (bus/client_crashes.log) before showing a fallback.
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught render error:', error, info.componentStack);
    reportCrash({
      source: 'error-boundary',
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  message: { fontSize: 13, color: '#888', textAlign: 'center' },
});
