# Who is in Paradise Pond?

CSC/SDS 235 Final Project  
Smith College — Spring 2026

**Team Members:**  
- Alina Abdulina  
- Meron Oumer  
- Tomoko Hida  

---

# Project Overview

This project is an interactive visual analytics dashboard exploring environmental and macroinvertebrate data collected from the Mill River and Paradise Pond.

Our goal is to help users:
- compare upstream and downstream river conditions,
- explore relationships between environmental variables and macroinvertebrate feeding groups,
- and investigate ecological patterns before and after sediment redistribution.

The dashboard allows users to interactively filter and compare environmental measurements across multiple coordinated views.

---

# Research Context

The data used in this project was collected from riffle sampling sites located upstream and downstream of Paradise Pond.

- **Upstream** serves as a control site.
- **Downstream** reflects areas potentially affected by sediment redistribution.

The project compares:
- **Before period:** 2019
- **After period:** 2020–2024

Environmental variables explored in the dashboard include:
- pH
- conductivity
- flow
- density
- feeding groups

---

# Dashboard Features

## Interactive Filters
Users can filter the dashboard by:
- season,
- period (before/after),
- and feeding group.

## Coordinated Views
Interactions in one chart highlight related data across the other visualizations.

## Comparative Analysis
The dashboard supports comparison between:
- upstream and downstream locations,
- environmental variables,
- and macroinvertebrate density patterns.

## Study Area Map
The dashboard includes a study area diagram to provide geographic context for the sampling sites around Paradise Pond.

---

# Technologies Used

- HTML
- CSS
- JavaScript
- D3.js

---
# Running the Project Locally

Because the dashboard loads a CSV file using D3.js, the project must be run through a local server.

Opening `index.html` directly in the browser may prevent the dataset from loading correctly.

---

# Start a Local Server

## 1. Open the Project Folder in Terminal

Navigate into the project directory:

```bash
cd path/to/project-folder
```

---

## 2. Start the Python Server

Run:

```bash
python3 -m http.server 8000
```

If `python3` does not work, try:

```bash
python -m http.server 8000
```

---

## 3. Open the Project in Your Browser

Go to:

```plaintext
http://localhost:8000
```

The dashboard should now load correctly with the dataset and interactive visualizations.

---

# Project Structure

```plaintext
project-folder/
│
├── index.html
├── style.css
├── index.js
├── vis_analysis.csv
├── map.png
└── README.md
```
# File Structure

```plaintext
project-folder/
│
├── index.html
├── style.css
├── index.js
├── vis_analysis.csv
├── map.png
└── README.md
```

---

# Data Source

Environmental and macroinvertebrate sampling data provided by:
- Marney Pratt
- Smith College Biology Department

Dataset used:
- `vis_analysis.csv`

---

# Future Improvements

Potential future additions include:
- richer temporal analysis,
- additional environmental variables,
- improved accessibility,
- mobile responsiveness,
- and expanded coordinated interactions.

---

# Course Information

CSC/SDS 235 — Visualization and Visual Analytics  
Smith College  
Spring 2026
