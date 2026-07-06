# backend/audio_analyzer.py
import numpy as np
import speech_recognition as sr
import wave
import audioop
import math
import re

class AudioAnalyzer:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        # Adjust for ambient noise more aggressively
        self.recognizer.energy_threshold = 300
        self.recognizer.dynamic_energy_threshold = True
        self.recognizer.pause_threshold = 0.8
    
    def transcribe_audio(self, audio_file_path):
        """Convert speech to text with better error handling"""
        try:
            with sr.AudioFile(audio_file_path) as source:
                # Record with adjusted settings
                audio = self.recognizer.record(source)
                
                try:
                    # Try Google Speech Recognition
                    text = self.recognizer.recognize_google(audio)
                    return text, True
                except sr.UnknownValueError:
                    return "Could not understand audio. Please speak clearly and loudly.", False
                except sr.RequestError as e:
                    return f"Speech recognition service error. Please check your internet connection.", False
        except Exception as e:
            print(f"Transcription error: {e}")
            return "Audio processing error. Please try again.", False
    
    def analyze_audio_quality(self, audio_file_path):
        """Analyze audio quality with better metrics"""
        try:
            # Read audio file
            with wave.open(audio_file_path, 'rb') as wf:
                # Get audio parameters
                frames = wf.readframes(wf.getnframes())
                audio_data = np.frombuffer(frames, dtype=np.int16)
                sample_rate = wf.getframerate()
                n_frames = wf.getnframes()
                duration = n_frames / float(sample_rate)
            
            # Calculate RMS (volume)
            audio_data = audio_data.astype(np.float32)
            rms = np.sqrt(np.mean(audio_data**2))
            
            # Normalize volume (typical speaking level is around 1000-5000)
            if rms < 500:
                volume_level = 0.2
                volume_feedback = "Your voice is very quiet. Please speak closer to the microphone or increase your volume."
            elif rms < 1500:
                volume_level = 0.5
                volume_feedback = "Your voice is a bit quiet. Try to speak a little louder."
            elif rms < 10000:
                volume_level = 0.8
                volume_feedback = "Good volume level."
            else:
                volume_level = 0.6
                volume_feedback = "Your voice is loud. You might be too close to the microphone."
            
            # Check if there's actual speech (not just silence)
            max_amplitude = np.max(np.abs(audio_data)) if len(audio_data) > 0 else 0
            has_audio = max_amplitude > 500
            
            # Calculate background noise (using lowest 10% of samples)
            sorted_amplitudes = np.sort(np.abs(audio_data)) if len(audio_data) > 0 else [0]
            noise_floor = np.percentile(sorted_amplitudes, 10) if len(sorted_amplitudes) > 0 else 0
            
            # Calculate SNR
            if noise_floor > 0:
                snr = 20 * np.log10(rms / (noise_floor + 1))
            else:
                snr = 20
            
            # Clarity score based on duration and content
            if duration < 1.0:
                clarity_score = 0.2
                clarity_feedback = "Audio too short. Please speak for at least 2-3 seconds."
            elif duration < 2.0:
                clarity_score = 0.5
                clarity_feedback = "Good start, but try to speak a bit longer."
            else:
                clarity_score = 0.8
                clarity_feedback = "Good audio duration."
            
            # Overall quality score
            quality_score = (volume_level * 0.4 + clarity_score * 0.3)
            if snr > 20:
                quality_score += 0.2
            elif snr > 10:
                quality_score += 0.1
            
            quality_score = min(1.0, quality_score)
            
            # Determine if quality is good enough
            is_good = quality_score > 0.5 and has_audio
            
            # Compile feedback
            feedback_parts = []
            if not has_audio:
                feedback_parts.append("No speech detected. Please speak into the microphone.")
            else:
                feedback_parts.append(volume_feedback)
                if snr < 15:
                    feedback_parts.append("Some background noise detected. Try to find a quieter environment.")
                if clarity_score < 0.6:
                    feedback_parts.append(clarity_feedback)
            
            feedback = " ".join(feedback_parts) if feedback_parts else "Audio quality is good!"
            
            return {
                'quality_score': round(quality_score, 2),
                'volume_level': round(volume_level, 2),
                'snr': round(snr, 2),
                'duration': round(duration, 2),
                'has_audio': has_audio,
                'feedback': feedback,
                'is_good': is_good
            }
            
        except Exception as e:
            print(f"Audio analysis error: {e}")
            return {
                'quality_score': 0.5,
                'volume_level': 0.5,
                'snr': 0,
                'duration': 0,
                'has_audio': False,
                'feedback': f"Audio analysis error: {str(e)}",
                'is_good': False
            }
    
    def calculate_speech_clarity(self, text):
        """Calculate speech clarity based on transcript"""
        if not text or text == "":
            return 0.3, "No speech detected. Please speak your answer."
        
        words = text.split()
        word_count = len(words)
        
        # Check for filler words
        fillers = ['um', 'uh', 'like', 'you know', 'actually', 'basically', 'literally', 'so', 'well']
        filler_count = 0
        for filler in fillers:
            filler_count += text.lower().count(filler)
        
        # Check for repeated words
        word_freq = {}
        for word in words:
            word_lower = word.lower()
            word_freq[word_lower] = word_freq.get(word_lower, 0) + 1
        
        repeated_words = sum(1 for count in word_freq.values() if count > 3)
        
        # Calculate sentence length and structure
        sentences = re.split(r'[.!?]+', text)
        avg_sentence_length = sum(len(s.split()) for s in sentences) / max(len(sentences), 1)
        
        # Clarity scoring
        clarity_score = 0.5  # Base score
        
        # Word count bonus (optimal is 50-150 words)
        if 50 <= word_count <= 150:
            clarity_score += 0.2
        elif word_count > 30:
            clarity_score += 0.1
        elif word_count < 10:
            clarity_score -= 0.2
        
        # Filler word penalty
        if filler_count > 5:
            clarity_score -= 0.2
            clarity_feedback = "Try to reduce filler words like 'um', 'uh', 'like', and 'so'."
        elif filler_count > 2:
            clarity_score -= 0.1
            clarity_feedback = "Good answer, but try to reduce filler words."
        else:
            clarity_feedback = "Excellent clarity! Very few filler words."
        
        # Repeated word penalty
        if repeated_words > 0:
            clarity_score -= 0.1 * min(repeated_words, 3)
            clarity_feedback += " Avoid repeating the same words too often."
        
        # Sentence structure bonus
        if avg_sentence_length > 15:
            clarity_score += 0.1
        
        # Ensure score is between 0 and 1
        clarity_score = max(0.0, min(1.0, clarity_score))
        
        if word_count < 15:
            clarity_feedback = "Your answer was very brief. Elaborate more on your points for better clarity."
        elif clarity_score > 0.8:
            clarity_feedback = "Excellent clarity! Your answer was well-structured and easy to understand."
        
        return round(clarity_score, 2), clarity_feedback
    
    def test_microphone(self):
        """Simple microphone test"""
        try:
            with sr.Microphone() as source:
                print("Adjusting for ambient noise...")
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
                print("Recording test audio...")
                audio = self.recognizer.record(source, duration=3)
                
                if audio is None:
                    return False, "No audio captured. Please check your microphone.", ""
                
                try:
                    text = self.recognizer.recognize_google(audio)
                    return True, "Microphone working properly!", text
                except sr.UnknownValueError:
                    return True, "Microphone detected but speech not clear. Try speaking louder.", ""
                except sr.RequestError:
                    return True, "Microphone working but recognition service unavailable.", ""
                    
        except sr.RequestError as e:
            return False, f"Could not request results: {e}", ""
        except sr.UnknownValueError:
            return False, "Could not understand audio. Please speak clearly.", ""
        except Exception as e:
            return False, f"Microphone error: {str(e)}", ""