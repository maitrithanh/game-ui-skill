# Building by platform

Every platform shares `tokens.json`. Use the `assets/kit.css` + `kit.js` kit **unchanged** for anything running in a web view. For native platforms, rebuild components using the formulas below and keep the token measurements exact.

| Platform | Approach |
| --- | --- |
| Web, PWA | Use the kit directly |
| Electron, Tauri, Wails (desktop software) | Use the kit directly, `layout: "desktop"`, and add keyboard shortcuts (Desktop section) |
| Capacitor, Cordova, WebView in an app | Use the kit directly, `layout: "mobile"` |
| React Native / Expo | RN formula below |
| Flutter | Flutter formula |
| iOS SwiftUI | SwiftUI formula |
| Android Jetpack Compose | Compose formula |
| Unity, Godot, other engines | Engine formula |

## Four core formulas (apply to every platform)

1. **Thick block** = 3 stacked layers, with no shadow blur:
  - Bottom layer: same shape, `ink` color, offset down by `lift` (3).
  - Face layer: `base` background, 2px `ink` outline, rounded by `radius`.
  - Bottom lip: `dark` strip with height `lip` (4), inside the face at the bottom. Add a 40% white highlight across the top 30%.
2. **Press sinks**: on press, move the face down by exactly `lift`, hide the bottom ink layer, and reduce the bottom lip by half. Restore it with `spring` on release.
3. **White text with ink outline**: draw text twice, first with an `ink` stroke about 0.13–0.14em wide, then with white fill over it. On platforms without text strokes, draw the ink version offset in 8 directions by 1–2px.
4. **Blur only in High Graphics mode**. Normal mode must look complete using the three layers above.

---

## React Native / Expo

```tsx
function ThickButton({ color = "yellow", label, onPress, big }: Props) {
  const c = tokens.color[color];
  const [down, setDown] = useState(false);
  const h = big ? 60 : 44, r = big ? 22 : 18;
  return (
    <Pressable onPressIn={() => setDown(true)} onPressOut={() => setDown(false)} onPress={onPress}
      accessibilityRole="button" style={{ height: h + 3 }}>
      {!down && <View style={{ position: "absolute", top: 3, left: 0, right: 0, height: h, borderRadius: r, backgroundColor: ink }} />}
      <View style={{ height: h, borderRadius: r, borderWidth: 2, borderColor: ink, backgroundColor: c.base,
                     overflow: "hidden", transform: [{ translateY: down ? 3 : 0 }], justifyContent: "center", alignItems: "center" }}>
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: down ? 2 : 4, backgroundColor: c.dark }} />
        <View style={{ position: "absolute", top: 3, left: "12%", right: "12%", height: "30%", borderRadius: 99, backgroundColor: "rgba(255,255,255,.4)" }} />
        <OutlinedText color={color === "yellow" ? ink : "#fff"}>{label.toUpperCase()}</OutlinedText>
      </View>
    </Pressable>
  );
}
```

- Outlined text: use `react-native-svg` to draw `<Text stroke={ink} strokeWidth=…>`, then overlay `<Text fill="#fff">`.
- Motion: use `react-native-reanimated` with `withSpring` (damping ~12, stiffness ~260) for `spring`.
- Haptics: `expo-haptics` (`impactAsync(Light)` on selection, `notificationAsync(Success)` on win).
- Sound: short WAV files (see Native sound), played with `expo-av`.
- Characters: pass the SVG string from `GameUI.avatar()` directly to `SvgXml`.

## Flutter

```dart
class ThickButton extends StatefulWidget { … }
// build():
final h = big ? 60.0 : 44.0, r = BorderRadius.circular(big ? 22 : 18);
return GestureDetector(
  onTapDown: (_) => setState(() => down = true),
  onTapUp: (_) => setState(() => down = false), onTapCancel: () => setState(() => down = false),
  onTap: onPressed,
  child: SizedBox(height: h + 3, child: Stack(children: [
    if (!down) Positioned(top: 3, left: 0, right: 0, height: h,
        child: DecoratedBox(decoration: BoxDecoration(color: ink, borderRadius: r))),
    AnimatedPositioned(duration: const Duration(milliseconds: 140), curve: Curves.easeOutBack,
      top: down ? 3 : 0, left: 0, right: 0, height: h,
      child: Container(
        decoration: BoxDecoration(color: base, borderRadius: r, border: Border.all(color: ink, width: 2)),
        clipBehavior: Clip.antiAlias,
        child: Stack(alignment: Alignment.center, children: [
          Positioned(bottom: 0, left: 0, right: 0, height: down ? 2 : 4, child: ColoredBox(color: dark)),
          OutlinedText(label.toUpperCase()),
        ]),
      )),
  ])),
);
```

- Outlined text: use a `Stack` with two `Text` widgets; the lower one has `foreground: Paint()..style = PaintingStyle.stroke..strokeWidth = 4..color = ink`.
- `spring` ≈ a light `Curves.elasticOut` or `SpringSimulation`. Haptics: `HapticFeedback.lightImpact()`.
- Characters: use `flutter_svg` with `SvgPicture.string(...)`.

## iOS SwiftUI

```swift
struct ThickStyle: ButtonStyle {
  var base: Color, dark: Color, radius: CGFloat = 18
  func makeBody(configuration c: Configuration) -> some View {
    let down = c.isPressed
    return c.label
      .font(.custom("Grandstander-Black", size: 17)).textCase(.uppercase)
      .frame(maxWidth: .infinity, minHeight: 44)
      .background(alignment: .bottom) { Rectangle().fill(dark).frame(height: down ? 2 : 4) }
      .background(base)
      .clipShape(RoundedRectangle(cornerRadius: radius))
      .overlay(RoundedRectangle(cornerRadius: radius).stroke(ink, lineWidth: 2))
      .offset(y: down ? 3 : 0)
      .background(RoundedRectangle(cornerRadius: radius).fill(ink).offset(y: 3).opacity(down ? 0 : 1))
      .animation(.spring(response: 0.25, dampingFraction: 0.55), value: down)
  }
}
```

- Outlined text: use a `ZStack` with 8 ink-colored `Text` copies offset 1.5pt around the center, then place the white copy on top.
- Haptics: `UIImpactFeedbackGenerator(style: .light)`. Sound: synthesize kit-like tones with `AVAudioEngine` + `AVAudioSourceNode`, or use WAV files.

## Android Jetpack Compose

```kotlin
val src = remember { MutableInteractionSource() }
val down by src.collectIsPressedAsState()
val dy by animateDpAsState(if (down) 3.dp else 0.dp, spring(dampingRatio = 0.5f, stiffness = 600f))
Box(Modifier.height(h + 3.dp)) {
  if (!down) Box(Modifier.offset(y = 3.dp).fillMaxWidth().height(h).background(ink, shape))
  Box(Modifier.offset(y = dy).fillMaxWidth().height(h).clip(shape).background(base).border(2.dp, ink, shape)
        .clickable(src, indication = null, onClick = onClick), contentAlignment = Alignment.Center) {
    Box(Modifier.align(Alignment.BottomCenter).fillMaxWidth().height(if (down) 2.dp else 4.dp).background(dark))
    OutlinedText(label.uppercase())
  }
}
```

- Outlined text: place `Text(style = TextStyle(drawStyle = Stroke(width = 8f)), color = ink)` below white `Text`.
- Haptics: `LocalHapticFeedback.current.performHapticFeedback(...)`.

## Unity / Godot / engine

- Use 9-slice sprites for UI: a face (base + ink outline + bottom lip) and a hard ink-shadow sprite. Create sprites from tokens; do not redraw them with different measurements.
- Press: move `RectTransform`/`Control` down by `lift` px, hide the shadow sprite, and tween back with “OutBack” easing.
- Text: TextMeshPro Outline (`ink` color, ~0.25 width) / Godot `outline_size` + `outline_color`.
- Scale: set Canvas Scaler to the user’s preferred size (portrait 1080×1920, landscape 1920×1080).

## Desktop (software, Electron/Tauri, web on desktop)

- `GameUI.init({ layout: "desktop" })` → 1120px-wide column, `.split` divides main content and a 360px side column, with a compact CTA in the lower-right corner instead of full width.
- **Keyboard is required**: Enter = primary CTA, Esc = close modal / go back, Space = primary game action, number keys for choices. Show key hints with `<kbd>` in buttons (the kit hides them on touch devices).
- Support hover (the kit includes `@media (hover:hover)`) and use a `pointer` cursor for interactive elements.
- Give the window a minimum size (960×600 recommended); below that, fall back to the mobile layout.
- Keep the three-position topbar. The app’s system menu (File/Help) does not replace the in-game Settings button.

## Native sound

The web synthesizes sound with Web Audio and needs no files. Native platforms can do the same (AVAudioEngine, Oboe, `just_audio` with a prebuilt buffer) or use short WAV files. If using files, generate them from `GameUI.SFX` with `OfflineAudioContext` to preserve the same sound character. Sound plays only after the first interaction and always follows the Sound toggle.
