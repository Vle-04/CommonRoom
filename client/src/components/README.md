# Client architecture

```text
src/
  App.tsx                         Auth gate; signed-out state never mounts private content
  context/AuthContext.tsx         Session restore, registration, sign-in, sign-out
  components/
    auth/AuthPage.tsx             Sign in / sign up, profile image and terms acceptance
    profile/PersonalProfilePage.tsx Personal page, category tabs, media gallery, detail/about dialogs
    feed/                          Reserved for a followed-artists feed
    marketplace/                   Reserved for marketplace browsing/checkout
    trading/                       Reserved for public artist trade discovery
    navigation/                    Reserved for authenticated cross-app navigation
    layout/                        Reserved for additional authenticated page shells
  lib/api.ts                      Typed API calls and bearer session
```

`App.tsx` renders only the authentication page until the token is checked and the artist session is available. Feature components receive session details through `useAuth` and use `apiRequest` for server data.
