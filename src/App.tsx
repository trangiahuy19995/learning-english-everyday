import { useRoute } from './navigation'
import { ToastViewport } from './ui/components/Toast'
import { AppShell } from './ui/layout/AppShell'
import { AudioPlaylistScreen } from './ui/screens/AudioPlaylistScreen'
import { DeckDetailScreen } from './ui/screens/DeckDetailScreen'
import { DecksScreen } from './ui/screens/DecksScreen'
import { HomeScreen } from './ui/screens/HomeScreen'
import { PhraseEditor } from './ui/screens/PhraseEditor'
import { SessionRunner } from './ui/screens/SessionRunner'
import { SessionSetupScreen } from './ui/screens/SessionSetupScreen'
import { StatsScreen } from './ui/screens/StatsScreen'

export default function App() {
  const route = useRoute()

  if (route.name === 'session') {
    return (
      <>
        <SessionRunner />
        <ToastViewport />
      </>
    )
  }

  return (
    <>
      <AppShell route={route}>
        {route.name === 'home' && <HomeScreen />}
        {route.name === 'setup' && <SessionSetupScreen initialSource={route.source} />}
        {route.name === 'playlist' && <AudioPlaylistScreen deckId={route.deckId} />}
        {route.name === 'decks' && <DecksScreen />}
        {route.name === 'deck' && <DeckDetailScreen deckId={route.deckId} />}
        {route.name === 'phrase' && <PhraseEditor key={route.phraseId ?? 'new'} deckId={route.deckId} phraseId={route.phraseId} />}
        {route.name === 'stats' && <StatsScreen />}
      </AppShell>
      <ToastViewport />
    </>
  )
}
