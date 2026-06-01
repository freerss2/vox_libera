# Vox-Libera: A Free Path to Language

**Vox-Libera** is an independent, minimalist tool for language learners who value autonomy, privacy, and control over their study process.

---

## 1. Project Philosophy

In a world oversaturated with subscriptions and intrusive gamification, **Vox-Libera** offers a return to the essence of learning: a clean interface, your own data, and complete independence.

### Our Principles:
* **Free & Open-Source:** No hidden fees, advertising, or data collection. The code is community-owned.
* **Offline First:** The app runs directly from a local file. Your learning isn't dependent on internet access, servers, or cellular coverage.
* **Minimalism:** The interface is designed to eliminate distractions. Just you and the language.
* **Versatility:** The platform is language-agnostic. You create your own learning sets—whether it's Arabic, Bulgarian or Amharic.

---

## 2. Learning Logic: "The Seamless Path"

Vox-Libera is built on the principle of natural immersion. Each topic is a sequential journey consisting of several stages:

1.  **Vocabulary:** Introduction to the basic building blocks of the topic.
2.  **Phrases:** Transition from individual words to living constructs and context.
3.  **Exercises:** Interactive reinforcement of the material to build muscle memory.
4.  **Cross-cutting Navigation:** The "Next" button in the final exercise of a topic automatically moves you to the next section, turning the process into a continuous, logical flow.

---

## 3. Flexibility and Customization

Versatile architecture allows getting the same look-n-feel on desktop or mobile browser.
You are the architect of your own course. Vox-Libera allows you to create and load your own JSON files with custom lessons. There is no artificial rush for "points" or "streaks" as an end in itself. Move at your own pace, return to any point, and focus on what matters to you.

---

## 4. Keyboard Shortcuts (Desktop Toolbox)

For maximum efficiency on desktop, Vox-Libera supports a "hands-on-keyboard" workflow:

| Key | Action |
| :--- | :--- |
| `Esc` | Open / Close the topic menu |
| `←` / `→` | Navigate between topics (Back / Forward) |
| `↑` / `↓` | Quickly switch between exercises in the menu |
| `Enter` | Mark "Topic Completed" |

---

## 5. For Advanced Learners: Data Structure

Vox-Libera consumes data in a standard JSON format. This makes it easy to generate lessons using scripts, AI, or export them from existing flashcard systems.

### Example Lesson Structure:

```json
{
  "describe_yourself_1": {
      "index": 1,
      "name": "About yourself 1",
      "words": [
        ["Nice to meet you", "تشرفنا!", "Tasharrafna!"],
        ["name", "اسم", "Ism"]
      ],
      "sentences": [
        ["I work as a programmer", "أنا أعمل مبرمجاً", "Ana a'mal mubarmijan."]
      ]
  }
}

## 6. Troubleshooting: Text-to-Speech (TTS) Is Not Working on Android

If you cannot hear any voice output or text reading within the app, it is usually caused by misconfigured Android system settings, missing voice packs, or battery-saving restrictions.

Please follow these steps to resolve the issue:

### Step 1: Verify Your System TTS Settings
Our app relies on your device's built-in Text-to-Speech engine. Make sure it is properly configured:
1. Open your Android device Settings.
2. Navigate to System > Languages & input (or Additional settings > Accessibility on some devices).
3. Tap on Text-to-speech output (or Preferred engine).
4. Ensure that Speech Services by Google is selected as your preferred engine.

### Step 2: Download the Required Language Pack
If the engine is active but silent, the voice files for your language might not be installed:
1. In the Text-to-speech output menu, tap the Settings icon (gear) next to your preferred engine.
2. Tap Install voice data.
3. Locate your language from the list and make sure the high-quality voice pack is downloaded and installed.

### Step 3: Check "Wi-Fi Only" Restrictions
If you are using mobile data, the TTS engine might be blocked from downloading voice files on the go:
1. Go back to the TTS engine settings (the gear icon mentioned in Step 2).
2. Look for an option like Use Wi-Fi only or Amplify speech volume.
3. Disable Use Wi-Fi only to allow the engine to function properly over mobile networks.
