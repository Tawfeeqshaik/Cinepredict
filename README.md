# CinePredict

**Data-Driven Analysis and Success Prediction of Movies and OTT Content**

CinePredict is a web app that uses the TMDB 5000 movie data, machine learning, and explainable AI to help with two kinds of people:

- **Producers**, who want to know how a movie concept might do before it's made
- **Viewers**, who want better recommendations and a way to vote on upcoming concepts

We built it as a college project (Foundation of Data Science + Machine Learning PBL) at Chennai Institute of Technology, AI & ML department.

![Landing page](screenshots/01_landing_login_page.png)

> **Important:** CinePredict gives a *model-based estimate*, not a guarantee. It's a decision-support tool. It does not know what will actually succeed at the box office.

---

## The idea

Most movie sites show ratings, reviews and recommendations. They don't help a producer answer questions like *"is this concept worth pursuing, why does the model think so, and what happens if I change the budget?"*

So the flow we tried to build is:

**Predict → Explain → Simulate → Validate → Decide**

1. **Predict** – ML model gives a success probability for a concept
2. **Explain** – SHAP shows which inputs pushed the prediction up or down
3. **Simulate** – Scenario Lab lets you change budget / runtime / release month and compare
4. **Validate** – Viewers vote on concepts in Audience Lab, so there's a human signal too
5. **Decide** – the producer makes the call

---

## Features

### Producer mode

| Module | What it does |
|---|---|
| Strategic Overview | Dashboard with dataset stats, featured project evaluation, model confidence |
| Predictive Studio | Enter genre, budget, runtime, release month, cast popularity → get a success probability + SHAP drivers |
| Script Intelligence | Upload or paste a script (.pdf / .docx / .txt / .fountain), pulls out basic dimensions (INT/EXT ratio, characters, dialogue %, scenes, est. runtime), then runs the prediction and gives written feedback using the Gemini API |
| Greenlight Scenario Lab | Build several what-if scenarios and run them as a batch against the model |
| Opportunity & Gaps | Looks at which genre/language segments have high audience interest but low supply in the dataset |
| Prediction Tracker | Accuracy, ROC-AUC, confusion matrix, calibration bins |
| Model Integrity Audit | Compares the pre-release model with the engagement-aware model and checks for leakage |
| Audience Lab & Signals | Create concept tests, see viewer votes and compare them against the model |
| CineBot | Chat assistant for questions about SHAP drivers, risks, model comparison, and recommendations |

### Viewer mode

| Module | What it does |
|---|---|
| Personalized Feed | Taste profile built from liked films, plus concept voting |
| Audience Lab Voting | Vote on upcoming film concepts (would you watch it, 1–5 interest, comments) |
| Live Cinema Stream | Trending genres and titles |
| For You | Recommendations based on what you've liked |
| Discover & Hidden Gems | Similar-title discovery and lower-popularity, well-rated titles |
| Regional Cinema | Browse by language |
| Explore All Titles | Search and filter the whole dataset |
| Concept Battle | Pick between concepts to give an audience signal |

---

## Screenshots

### Producer

| | |
|---|---|
| ![Strategic Overview](screenshots/02_producer_strategic_overview.png) | ![Predictive Studio](screenshots/03_producer_predictive_studio.png) |
| Strategic Overview | Predictive Studio |
| ![Script Intelligence](screenshots/04_producer_script_intelligence.png) | ![Scenario Lab](screenshots/05_producer_scenario_lab_configured.png) |
| Script Intelligence | Scenario Lab (configured) |
| ![Scenario batch results](screenshots/06_producer_scenario_batch_results.png) | ![Opportunity and Gaps](screenshots/07_producer_opportunity_and_gaps.png) |
| Scenario batch results | Opportunity & Gaps |
| ![Prediction Tracker](screenshots/08_producer_prediction_tracker.png) | ![Model Integrity](screenshots/09_producer_model_integrity_audit.png) |
| Prediction Tracker | Model Integrity Audit |
| ![Audience Lab](screenshots/10_producer_audience_lab_signals.png) | ![CineBot](screenshots/11_producer_cinebot_ai_assistant.png) |
| Audience Lab Signals | CineBot |

### Viewer

| | |
|---|---|
| ![Personalized feed](screenshots/12_viewer_personalized_audience_feed.png) | ![Voting arena](screenshots/13_viewer_audience_lab_voting_arena.png) |
| Personalized Audience Feed | Audience Lab Voting |
| ![Live cinema](screenshots/14_viewer_live_cinema_stream.png) | ![For You](screenshots/15_viewer_for_you_recommendations.png) |
| Live Cinema Stream | For You |
| ![Hidden gems](screenshots/16_viewer_discover_hidden_gems.png) | ![Regional cinema](screenshots/17_viewer_regional_cinema_explorer.png) |
| Discover Hidden Gems | Regional Cinema Explorer |
| ![Explore titles](screenshots/18_viewer_explore_all_tmdb_titles.png) | ![Concept battle](screenshots/19_viewer_concept_battle_arena.png) |
| Explore All TMDB Titles | Concept Battle Arena |

---

## How it works

### Data

- **TMDB 5000 Movies** and **TMDB 5000 Credits** (Kaggle), joined on movie ID
- About 4,800 movies after cleaning and removing duplicates
- Files live in `dataset/`

### Success label

A movie counts as a success (`1`) if:

```
vote_average >= 6.5  AND  vote_count >= 100
```

Otherwise it's `0`. The `vote_count` condition is there so a movie with only a few votes doesn't count as a hit.

### Models

- **Random Forest** and **Logistic Regression** for success classification
- We train two versions on purpose:
  - **Model A (pre-release)** – only uses things you'd know before release (genre, budget, runtime, release month, cast/director history, etc.)
  - **Model B (engagement-aware)** – also uses things like vote count and popularity. This one is *post-release analysis only*, because those numbers don't exist before a movie comes out. It scores higher mostly because of that.
- Evaluated with accuracy, precision, recall, F1, ROC-AUC, and 5-fold cross-validation
- **SHAP** is used to explain predictions

### Data leakage

This is the part we spent the most time on. Rules we try to follow:

- Don't use vote average, vote count, revenue or popularity as inputs for the pre-release model
- Historical features (like a director's past success rate) should only use films released *before* the one being predicted

The Model Integrity page exists to show this: if a model looks too good, we check for leakage before trusting it.

### Recommendations

Content-based. Genres, keywords and overview text are combined, turned into vectors with **TF-IDF**, and compared using **cosine similarity**. For personalization, the vectors of films a viewer has liked are used to build a taste profile.

### Combined concept score

Audience Lab mixes the model with viewer votes:

```
Final Score = 0.6 × model probability + 0.4 × audience vote ratio
```

Example: 0.6 × 0.70 + 0.4 × 0.60 = 0.66. This is a formula we picked for the project, not an established standard. The two parts are shown separately so you can see where the number comes from.

### Scenario Lab

You change inputs (budget, runtime, release month, star power) and the model re-runs. These are what-if simulations on the model, **not** proof that changing the budget would cause a different real-world result.

### CineBot

Chatbot using the Google Gemini API, routed through our own logic (`chatbot_router.ts`) so answers about predictions and recommendations come from the app's data and not from the model making things up.

---

## Tech stack

| Part | Tech |
|---|---|
| Frontend | React, TypeScript, Vite, HTML/CSS |
| Backend | Node.js, Express, TypeScript |
| Data science / ML | Python, Pandas, NumPy, scikit-learn, SHAP, Matplotlib, Seaborn |
| Recommender | TF-IDF + cosine similarity |
| AI features | Google Gemini API (chatbot, script feedback) |
| Posters (optional) | TMDB API |
| Hosting | GitHub → Vercel |

### Code layout (main files)

```
server.ts                      API layer
src/data/tmdb_dataset.ts       dataset loading and cleaning
src/services/ml_engine.ts      model training and evaluation
src/services/chatbot_router.ts chatbot logic
```

### Repository structure

```
Cinepredict/
├── dataset/
│   ├── tmdb_5000_movies.csv
│   └── tmdb_5000_credits.csv
├── screenshots/        # the 19 screenshots used in this README
├── src/                # frontend + services
├── server.ts           # backend entry
├── package.json
└── README.md
```

---

## Running it locally

You need **Node.js 18+** and a modern browser. Python is only needed if you want to re-run the data science notebooks/scripts.

```bash
# 1. clone
git clone https://github.com/Tawfeeqshaik/Cinepredict.git
cd Cinepredict

# 2. install
npm install

# 3. set up environment variables (see below)

# 4. run
npm run dev
```

If `npm run dev` doesn't match your setup, check the `scripts` section in `package.json`.

### Environment variables

Create a `.env` file in the project root. **Never commit it** (it's in `.gitignore`).

```env
GEMINI_API_KEY=your_key_here
TMDB_API_KEY=your_key_here   # optional, only for live posters
```

Without a TMDB key, posters fall back to placeholders. Without a Gemini key, CineBot's AI answers and the script written feedback won't work.

### Demo logins

The login page has demo presets:

| Role | Username | Password |
|---|---|---|
| Producer | `producer_demo` | `demo123` |
| Viewer | `viewer_demo` | `demo123` |

---

## Known limitations

Being upfront about these:

- **It's a student project built on a small, old dataset.** TMDB 5000 only goes up to around 2017, so it doesn't reflect current films or streaming content.
- **Pre-release prediction is hard.** Budget, genre, runtime and release month don't say much about whether a movie will be rated well. Earlier in development Model A's ROC-AUC on pre-release features was close to 0.5, and we're still working on honest improvements (director/studio track record, etc.). Treat any single probability as a rough signal.
- **Model B scores higher because it uses post-release information.** That's not a fair "prediction", so it's labelled as engagement-aware analysis.
- **Some data in the demo is placeholder/synthetic**, and some modules (e.g. parts of Live Cinema, Regional Cinema, Audience Lab responses) use demo data instead of a live source. Regional coverage in the dataset is thin.
- **Script Intelligence's structural extraction is rule-based/heuristic** (counting INT/EXT, characters, dialogue, etc.), not a trained NLP model. The written feedback comes from Gemini.
- Prediction Tracker currently shows validation metrics on the dataset; it is not yet tracking real-world outcomes of new predictions over time.

---

## Future work

- Better pre-release features (director, studio and cast history, calculated without leaking future data)
- Probability calibration and uncertainty estimates
- Newer and larger datasets, real TMDB integration
- Review sentiment analysis
- Collaborative filtering / hybrid recommender
- Real tracking of predictions against actual outcomes
- Automated retraining and monitoring

---

## Team

- **Shaik Tawfeeq Ahamad**
- **Jeevan Ram P B I**

Mentor / guide: Dr. R. Gowri, Head of Department, AI & ML, Chennai Institute of Technology

## References

1. Lee, K., Park, J., Kim, I., Choi, Y. (2017). *Predicting Movie Success with Machine Learning Techniques: Ways to Improve Accuracy.* Multimedia Tools and Applications.
2. Agarwal, M. et al. (2021). *A Comprehensive Study on Various Statistical Techniques for Prediction of Movie Success.* https://arxiv.org/abs/2112.00395
3. Awan, M. J. et al. (2021). *A Recommendation Engine for Predicting Movie Ratings Using Machine Learning.* Electronics, 10(10), 1215.
4. Udandarao, V., Gupta, P. (2024). *Movie Revenue Prediction using Machine Learning Models.* https://arxiv.org/abs/2405.11651
5. Dhir, R., Raj, A. et al. (2018). *Movie Success Prediction using Machine Learning Algorithms and their Comparison.* ICSCCC 2018.

## License / data

Dataset: TMDB 5000 Movie Dataset from Kaggle, used for educational purposes. This product uses TMDB data but is not endorsed or certified by TMDB.
