// ============================================================
//  DRAG & DROP SYSTEM  v4
//  Fix 4: wider drop zone (detect right 560px of screen)
//  Fix 5: close (X) button wires up here with smooth out-animation
//  v4 Mobile: double-tap to open skill panel; drag disabled on touch
// ============================================================

(function () {
  const skillDatabase = {
    'Python': {
      description: 'Core language for ML, data science, and backend development. Expertise in scripting, automation, and scientific computing.',
      tools: ['NumPy', 'Pandas', 'Scikit-learn', 'PyTorch', 'TensorFlow']
    },
    'PyTorch': {
      description: 'Deep learning framework preferred for research and production. Experience with custom models, training loops, and GPU optimization.',
      tools: ['TorchVision', 'TorchText', 'Lightning', 'ONNX', 'torchmetrics']
    },
    'TensorFlow': {
      description: 'End-to-end ML platform for building and deploying models. Used for CNNs, RNNs, and transformer-based architectures.',
      tools: ['Keras', 'TFLite', 'TF Serving', 'TF Hub', 'TF Datasets']
    },
    'LLMs': {
      description: 'Large Language Model expertise including fine-tuning, prompt engineering, and RAG implementation. Experience with GPT, LLaMA, Gemini, and Mistral.',
      tools: ['Hugging Face', 'vLLM', 'Ollama', 'Together AI', 'Groq']
    },
    'RAG': {
      description: 'Retrieval-Augmented Generation for context-aware AI applications. Expertise in vector DBs, embeddings, chunking strategies, and retrieval pipelines.',
      tools: ['LangChain', 'LlamaIndex', 'ChromaDB', 'FAISS', 'Pinecone']
    },
    'LangChain': {
      description: 'Framework for building LLM applications. Skilled in chains, agents, memory management, and complex multi-step workflows.',
      tools: ['LangGraph', 'LCEL', 'LangChain Hub', 'Callbacks', 'Tool Use']
    },
    'NLP': {
      description: 'Natural Language Processing for text analysis, summarization, and semantic understanding. Experience with transformers and statistical NLP.',
      tools: ['NLTK', 'Transformers', 'spaCy', 'BERT', 'Sentence-Transformers']
    },
    'CrewAI': {
      description: 'Multi-agent collaboration framework for complex AI workflows. Building autonomous agent teams with specialized roles and hierarchical task planning.',
      tools: ['Role-based Agents', 'Task Management', 'Tool Integration', 'Hierarchical Planning']
    },
    'FastAPI': {
      description: 'Modern Python web framework for building high-performance APIs. Used for ML model serving and production backend systems.',
      tools: ['Uvicorn', 'Pydantic', 'Starlette', 'SQLAlchemy', 'Async I/O']
    },
    'Docker': {
      description: 'Containerization for reproducible ML environments and microservices. Expertise in Docker Compose and multi-stage builds.',
      tools: ['Docker Compose', 'Volumes', 'Networks', 'Registry', 'BuildKit']
    },
    'MLflow': {
      description: 'ML lifecycle management platform. Tracking experiments, managing model artifacts, and deploying models to production.',
      tools: ['Experiment Tracking', 'Model Registry', 'Artifact Store', 'Serving', 'Projects']
    },
    'BentoML': {
      description: 'Framework for packaging and serving ML models as production APIs. Managing model versions and deployment pipelines.',
      tools: ['Service', 'Runners', 'Adapters', 'Deployments', 'Model Store']
    },
    'AWS EC2': {
      description: 'Cloud compute infrastructure for running ML workloads at scale. Experience with instance management, security groups, and GPU setup.',
      tools: ['EC2', 'S3', 'SageMaker', 'Lambda', 'CloudFormation']
    },
    'ChromaDB': {
      description: 'Lightweight vector database for semantic search and embeddings storage. Used in RAG pipelines for local and cloud deployments.',
      tools: ['Collections', 'Embeddings', 'Metadata Filtering', 'Persistence', 'Client-Server']
    },
    'FAISS': {
      description: 'Facebook AI Similarity Search library for efficient large-scale vector similarity search at high throughput.',
      tools: ['IndexFlatL2', 'IndexHNSW', 'GPU Indexes', 'Product Quantization', 'IVF']
    },
    'PostgreSQL': {
      description: 'Robust relational database for production applications. Experience with complex queries, indexing, optimization, and pgVector for AI workloads.',
      tools: ['pgVector', 'PostGIS', 'JSON Operators', 'Full Text Search', 'Replication']
    },
    'Transformers': {
      description: 'Hugging Face Transformers library for state-of-the-art NLP and vision. Fine-tuning BERT, Pegasus, GPT, and custom model implementations.',
      tools: ['Model Hub', 'Pipelines', 'Tokenizers', 'AutoModel', 'TrainingArguments']
    },
    'Scikit-learn': {
      description: 'Classical machine learning library for supervised and unsupervised learning. Model selection, preprocessing, feature engineering, and evaluation.',
      tools: ['Classifiers', 'Regressors', 'Clustering', 'Pipeline', 'Ensemble Methods']
    },
    'Spark': {
      description: 'Distributed computing framework for processing large-scale datasets. Experience with Spark SQL, DataFrames, and MLlib for big data ML.',
      tools: ['PySpark', 'Spark SQL', 'DataFrames', 'MLlib', 'Streaming']
    }
  };

  const panelElement  = document.getElementById('skill-detail-panel');
  const closeBtn      = document.getElementById('skill-panel-close');
  const orbitCanvas   = document.getElementById('orbit-canvas');

  // ─── Touch / pointer detection ────────────────────────────
  // isTouchDevice is true for phones/tablets; false for desktops with mouse.
  // We detect once at load; media queries mirror this in CSS.
  const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  // Fix 4: drop zone = rightmost 560px of viewport (larger target)
  function getDropZoneLeft() {
    return window.innerWidth - 560;
  }

  let isDragging    = false;
  let draggedSkill  = null;
  let lastMouseX    = 0;
  let hasUserInteracted = false;

  // Shared drag state for orbit.js
  window.dragState = { isDragging: false, draggedSkill: null, mouseX: 0, mouseY: 0 };

  document.addEventListener('mousemove', (e) => {
    lastMouseX = e.clientX;
    window.dragState.mouseX = e.clientX;
    window.dragState.mouseY = e.clientY;
  });

  // ─── Desktop Drag Start ───────────────────────────────────
  document.addEventListener('skillDragStart', (e) => {
    if (isTouchDevice) return; // touch handled separately
    if (!hasUserInteracted) {
      orbitCanvas && orbitCanvas.classList.add('hint-shown');
      hasUserInteracted = true;
    }
    isDragging   = true;
    draggedSkill = e.detail.label;
    window.dragState.isDragging   = true;
    window.dragState.draggedSkill = draggedSkill;
  });

  // ─── Desktop Drag End ─────────────────────────────────────
  document.addEventListener('skillDragEnd', (e) => {
    if (isTouchDevice) return; // touch handled separately
    const skillName = e.detail.label;
    const inDropZone = lastMouseX > getDropZoneLeft();
    if (inDropZone && skillName) {
      displaySkillDetails(skillName);
    }
    isDragging   = false;
    draggedSkill = null;
    window.dragState.isDragging   = false;
    window.dragState.draggedSkill = null;
  });

  // ─── Mobile: Double-tap on canvas to open skill panel ─────
  // orbit.js fires a custom 'skillDoubleTap' event with the label.
  document.addEventListener('skillDoubleTap', (e) => {
    const skillName = e.detail.label;
    if (skillName) {
      displaySkillDetails(skillName);
      if (!hasUserInteracted) {
        orbitCanvas && orbitCanvas.classList.add('hint-shown');
        hasUserInteracted = true;
      }
    }
  });

  // ─── Display Skill Details ────────────────────────────────
  function displaySkillDetails(skillName) {
    const skill = skillDatabase[skillName];
    if (!skill) return;

    document.getElementById('detail-skill-name').textContent = skillName;
    document.getElementById('detail-skill-desc').textContent = skill.description;

    const toolsContainer = document.getElementById('detail-skill-tools');
    if (skill.tools && skill.tools.length > 0) {
      toolsContainer.innerHTML = `
        <label class="skill-detail-tools-label">Related Tools &amp; Frameworks</label>
        <div class="skill-detail-tags">
          ${skill.tools.map(tool => `<div class="skill-detail-tag">${tool}</div>`).join('')}
        </div>
      `;
    } else {
      toolsContainer.innerHTML = '';
    }

    // Re-trigger content animation by cloning
    const content = panelElement.querySelector('.skill-detail-content');
    if (content) {
      content.style.animation = 'none';
      content.offsetHeight; // reflow
      content.style.animation = '';
    }

    panelElement.classList.add('active');
  }

  // Expose for orbit.js mobile tap
  window.displaySkillDetails = displaySkillDetails;

  // ─── Fix 5: Close Button ──────────────────────────────────
  function closePanel() {
    panelElement.classList.remove('active');
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closePanel();
    });
    // Touch tap on close button
    closeBtn.addEventListener('touchend', (e) => {
      e.stopPropagation();
      e.preventDefault();
      closePanel();
    }, { passive: false });
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panelElement.classList.contains('active')) {
      closePanel();
    }
  });

  // Close on click outside panel (but not on canvas drag)
  document.addEventListener('click', (e) => {
    if (!isDragging &&
        !panelElement.contains(e.target) &&
        !e.target.closest('canvas') &&
        panelElement.classList.contains('active')) {
      closePanel();
    }
  });

  // Close on touch outside panel (mobile)
  document.addEventListener('touchend', (e) => {
    if (!panelElement.contains(e.target) &&
        !e.target.closest('canvas') &&
        panelElement.classList.contains('active')) {
      // Small delay so the panel-open tap itself doesn't immediately re-close
      setTimeout(closePanel, 50);
    }
  }, { passive: true });

  // ─── Responsive: hide panel below 1024px — now CSS handles it ─
  // (Panel repositioning is done in CSS; no JS override needed)
  function handleResize() {
    // Panel visibility is now fully handled in CSS (bottom-sheet on mobile)
    // Nothing to override here
  }
  window.addEventListener('resize', handleResize);
  handleResize();
})();