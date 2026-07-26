import {
  useEffect,
  useRef,
  useState
} from "react";

import "./index.css";


type SpeechRecognitionEvent = Event & {
  results: SpeechRecognitionResultList;
};


interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;

  start(): void;

  stop(): void;

  onresult:
    | ((event: SpeechRecognitionEvent) => void)
    | null;

  onend:
    | (() => void)
    | null;

  onerror:
    | ((event: Event) => void)
    | null;
}


declare global {

  interface Window {

    SpeechRecognition?: new () =>
      SpeechRecognitionInstance;

    webkitSpeechRecognition?: new () =>
      SpeechRecognitionInstance;

  }

}


function App() {

  const [
    listening,
    setListening
  ] = useState(false);


  const [
    processing,
    setProcessing
  ] = useState(false);


  const [
    transcript,
    setTranscript
  ] = useState("");


  const [
    response,
    setResponse
  ] = useState(
    "Hello! I am Babu AI. How can I help you?"
  );


  const recognitionRef =
    useRef<SpeechRecognitionInstance | null>(
      null
    );


  useEffect(() => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

      setResponse(
        "Speech recognition is not supported in this browser."
      );

      return;

    }


    const recognition =
      new SpeechRecognition();


    recognition.lang =
      "en-IN";


    recognition.continuous =
      false;


    recognition.interimResults =
      false;


    recognition.onresult =
      async (event) => {

        const text =
          event.results[0][0].transcript;


        setTranscript(text);

        setListening(false);

        await sendCommand(text);

      };


    recognition.onend =
      () => {

        setListening(false);

      };


    recognition.onerror =
      () => {

        setListening(false);

        setResponse(
          "Sorry, I could not hear you."
        );

      };


    recognitionRef.current =
      recognition;

  }, []);


  function speak(text: string) {

    window.speechSynthesis.cancel();


    const utterance =
      new SpeechSynthesisUtterance(
        text
      );


    utterance.lang =
      "en-IN";


    utterance.rate =
      1;


    window.speechSynthesis.speak(
      utterance
    );

  }


  function startListening() {

    if (
      !recognitionRef.current
    ) {

      return;

    }


    setTranscript("");

    setResponse(
      "Listening..."
    );


    setListening(true);


    recognitionRef.current.start();

  }


  async function sendCommand(
    command: string
  ) {

    setProcessing(true);

    setResponse(
      "Thinking..."
    );


    try {

      const result =
        await fetch(
          "http://127.0.0.1:8000/api/command",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              command
            })
          }
        );


      if (!result.ok) {

        throw new Error(
          "Backend error"
        );

      }


      const data =
        await result.json();


      setResponse(
        data.reply
      );


      speak(
        data.reply
      );


    } catch (error) {

      console.error(
        error
      );


      const errorMessage =
        "Backend se connection nahi ho raha. Please Python server check karo.";


      setResponse(
        errorMessage
      );


      speak(
        errorMessage
      );

    } finally {

      setProcessing(false);

    }

  }


  return (

    <div className="app">

      <div className="background-orb orb-one" />

      <div className="background-orb orb-two" />


      <main className="assistant-card">

        <div className="status">

          <span
            className={
              listening
                ? "status-dot active"
                : "status-dot"
            }
          />

          {listening
            ? "Listening"
            : processing
              ? "Processing"
              : "Ready"}

        </div>


        <h1>
          BABU AI
        </h1>


        <p className="subtitle">
          Your Voice Laptop Assistant
        </p>


        <div
          className={
            listening
              ? "voice-orb listening"
              : processing
                ? "voice-orb processing"
                : "voice-orb"
          }
        >

          <div className="orb-core">

            🎙️

          </div>

        </div>


        <div className="conversation">

          <div className="user-message">

            <strong>
              You
            </strong>

            <p>
              {transcript ||
                "Say something..."}
            </p>

          </div>


          <div className="ai-message">

            <strong>
              Babu AI
            </strong>

            <p>
              {response}
            </p>

          </div>

        </div>


        <button
          className={
            listening
              ? "mic-button active"
              : "mic-button"
          }
          onClick={
            startListening
          }
          disabled={
            listening ||
            processing
          }
        >

          {listening
            ? "Listening..."
            : processing
              ? "Processing..."
              : "🎤 Tap & Speak"}

        </button>


        <div className="examples">

          <span>
            Try:
          </span>

          <button
            onClick={() =>
              sendCommand(
                "Open Chrome"
              )
            }
          >
            Open Chrome
          </button>

          <button
            onClick={() =>
              sendCommand(
                "Take a screenshot"
              )
            }
          >
            Screenshot
          </button>

          <button
            onClick={() =>
              sendCommand(
                "Open Downloads folder"
              )
            }
          >
            Downloads
          </button>

        </div>

      </main>

    </div>

  );

}


export default App;
