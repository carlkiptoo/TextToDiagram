#  Text-to-Diagram Generator

> Convert natural language descriptions into interactive flow diagrams using a local LLM (via Ollama) and Mermaid.js.

This project takes any textual description of a process, extracts nodes and edges using a lightweight LLM (e.g. `phi3:mini`), and renders a visual flowchart directly in the browser.

---

##  Features

- ** Natural Language → JSON → Diagram**  
  Type a description like *"A user logs in, resets their password, and is redirected to the dashboard"* → get a complete Mermaid flowchart.

- ** Local LLM Inference (no API keys needed)**  
  Uses Ollama and open models like `phi3:mini` for fast, offline generation.

- ** Next.js 14 App Router backend**  
  Lightweight API route to process model responses.

- ** Robust JSON Parsing**  
  Cleans, repairs, and normalizes model outputs to avoid crashes.

- ** Dynamic Mermaid Rendering**  
  Handles missing nodes gracefully, normalizes identifiers, and shows placeholder nodes for incomplete model outputs.

---

##  Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Mermaid.js** for diagram rendering
- **Ollama** for local LLM inference (`phi3:mini` by default)
- **Vercel / localhost** for deployment

---

##  Installation

### 1️ Clone the Repo
```bash
git clone [https://github.com/your-username/text-to-diagram.git](https://github.com/carlkiptoo/TextToDiagram.git)
cd text-to-diagram
2️ Install Dependencies
bashnpm install
3️ Install & Run Ollama
Download Ollama and install the phi3:mini model:
bashollama pull phi3:mini
ollama serve

 You can swap in other models like llama3.2:3b or mistral if you need more reasoning power (but they'll be slower on CPU).

4️ Run the Development Server
npm run dev
Visit http://localhost:3000 to try it out.

 How It Works

 User enters text describing a flow (e.g. signup process)
 Next.js API route sends the text to Ollama's local API (localhost:11434/api/generate)
 The model returns structured JSON with nodes and edges
 The server normalizes IDs, auto-adds missing nodes, and builds a valid Mermaid diagram string
 Mermaid.js renders the flowchart in the browser


 Example
Input
textA user opens the Instagram app.
They land on the login screen.
If they don't have an account, they tap "Sign up".
The signup form asks for their username, email, and password.
After submission, a verification email is sent.
The user clicks the verification link, and the account is activated.
Finally, they're redirected to their new home feed.
 Output (Mermaid)
mermaidgraph TD
  user["User"]
  open_instagram_app["Open Instagram App"]
  login_screen["Login Screen"]
  sign_up["Sign Up"]
  fill_signup_form["Fill Signup Form"]
  verification_email_sent["Verification Email Sent"]
  account_activated["Account Activated"]
  home_feed["Home Feed"]
  user --> open_instagram_app
  open_instagram_app --> login_screen
  login_screen --> sign_up
  sign_up --> fill_signup_form
  fill_signup_form --> verification_email_sent
  verification_email_sent --> account_activated
  account_activated --> home_feed

 Configuration
You can change the model by editing:
typescript// src/app/api/generate/route.ts
model: "phi3:mini"
Other good options:

"llama3.2:3b" – bigger, more accurate, still fast
"mistral" – more detailed outputs, slower on CPU


 Tips for Better Results

 Write clear, step-by-step descriptions — the more explicit, the better the diagram.
 Use snake_case IDs in model outputs or rely on automatic normalization.
 You can strengthen the system prompt to enforce more structured extractions (e.g., minimum number of nodes, branches, etc.).


  Next Steps

 Support multiple diagram types (flowcharts, sequence diagrams, etc.)
 Add UI for switching models dynamically
 Evaluate model outputs with automated tests
 Support streaming diagram rendering as model generates JSON


 Contributing
Contributions are welcome! Please fork the repo and open a PR with improvements, bug fixes, or prompt engineering tricks.

 License
MIT License © 2025 [Kiptoo Carlos]
