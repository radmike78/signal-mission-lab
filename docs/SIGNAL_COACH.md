# Signal Coach

Open **Signal Coach** in the main navigation. Confirm the fictional training scope, choose an IT lesson and select an installation, configuration or troubleshooting goal. Type a question or use **Speak question** on a browser with installed U.S. English speech recognition. Review the transcript and select **Ask Signal Coach**. Choose **Text only** or **Speak replies aloud** under **Coach replies**. Spoken mode automatically plays each new reply using an installed U.S. English voice and also displays the text. Use **Stop audio** or replay an individual reply with **Read reply aloud**. Typed questions and spoken responses work independently of microphone access. If no local U.S. English voice is available, read the transcript. The packaged mobile editions offer typed input and do not request microphone access.

Lesson guidance is available without a model. **Use experimental on-device AI when installed** opts into the browser Prompt API for the session. The coach only uses a model reporting that it is already available. Signal Mission Lab supplies no model weights, starts no downloads and has no cloud fallback. A failed or unsupported model falls back to lesson guidance. Supported desktop browsers and hardware vary. Installations should be tested against the exact managed browser, model and microphone policy.

Attach one fictional TXT, MD, DOCX, PDF, PNG or JPEG up to 5 MB. For short scanned PDFs, select OCR first. Compare and correct each OCR page before using it. The coach uses only the selected excerpt up to 1,200 characters. Image handling extracts printed English text. It does not identify equipment or interpret wiring from a photo. Existing document screening is a safeguard for training and is not a classifier or declassification tool.

The generated response is plain text. The model receives bounded lesson notes, the learner question, eligible recent questions and the explicitly selected excerpt. Inputs are treated as untrusted. The model has no tools, command execution or authority over scoring. Generated claims need verification against the listed public references. Never enter classified, CUI, credential, COMSEC or operational information. Leaving the coach or clearing its session releases application references, stops active device work and cancels audio. This is memory cleanup, not secure erasure of the host.

## Editions and verification

The internet-connected web edition can serve Signal Coach with public training assets and a separate same-origin account API. The website needs HTTPS and a same-origin microphone policy for browser dictation. The disconnected ZIP includes text guidance, technical labs and local document/OCR assets. Generative dialogue and speech depend on browser/OS features already provisioned on that workstation, so the ZIP alone does not guarantee them.

A separately approved offline installer must specify the OS, managed browser or bundled runtime, signed artifact and update chain, licensing, local storage and any model or speech dependencies. Validate setup, restart, assessment, attachment review and optional voice on a clean representative device with all network access denied. The demo is for fictional training. The receiving organization decides whether its environment permits the exact package and intended use.

Browser contract tests mock model and speech APIs and use real image OCR. They check unavailable-model fallback, transcript confirmation, excerpt isolation, sensitive-input screening, cleanup, network/storage behavior and mobile accessibility. Physical microphone, native voices and real installed-model answer quality require device acceptance.

References: [Chrome Prompt API](https://developer.chrome.com/docs/ai/prompt-api), [on-device speech recognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/processLocally), [local voice detection](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService).

The **Army classroom cases** group uses the same fictional case evidence as
IT Foundations. It provides a deterministic next-check prompt and asks the
learner to describe user-level recovery. These cases do not accept attachments
or call the model. Read the matching lesson for the scored decision and feedback.
