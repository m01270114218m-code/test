import 'package:flutter/material.dart';
import 'screens/splash_screen.dart';

class ImChatApp extends StatelessWidget {
  const ImChatApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
    debugShowCheckedModeBanner: false,
    title: 'Im Chat',
    theme: ThemeData(useMaterial3: true, fontFamily: 'SegoeUI', colorSchemeSeed: Colors.deepPurple),
    home: const SplashScreen(),
  );
}
