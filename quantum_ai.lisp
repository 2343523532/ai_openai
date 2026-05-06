(defpackage :quantum-super-ai
  (:use :cl)
  (:export :create-quantum-super-ai
           :run-cycle
           :run-demo
           :summarize-ai))

(in-package :quantum-super-ai)

(defparameter *demo-random-state* (make-random-state t)
  "Dedicated random state so the demo does not mutate the host image's default generator.")

(defstruct (quantum-super-ai
            (:constructor %make-quantum-super-ai))
  memory
  knowledge-base
  performance-log
  state-space
  learning-rate
  iteration
  sandbox-ledger-balance
  sandbox-asset-balance
  sandbox-node-id
  sandbox-wallet-id
  risk-log)

(defun random-between (min max)
  "Return a pseudo-random float between MIN and MAX for sandbox simulation only."
  (+ min (* (random 1.0 *demo-random-state*) (- max min))))

(defun stable-digest (input)
  "Return a deterministic 64-character hash-like hex digest for demo identifiers.
This is intentionally not cryptographic; it simply keeps the script dependency-free."
  (let* ((text (write-to-string input))
         (part-a (format nil "~16,'0X" (abs (sxhash text))))
         (part-b (format nil "~16,'0X" (abs (sxhash (concatenate 'string text "-B")))))
         (part-c (format nil "~16,'0X" (abs (sxhash (concatenate 'string text "-C")))))
         (part-d (format nil "~16,'0X" (abs (sxhash (concatenate 'string text "-D"))))))
    (concatenate 'string part-a part-b part-c part-d)))

(defun make-sandbox-id (prefix payload &optional (length 16))
  "Create a readable, fake identifier that cannot be confused for a real credential."
  (format nil "~A-DEMO-~A" prefix (subseq (stable-digest payload) 0 length)))

(defun create-quantum-super-ai ()
  "Create a fully initialized sandbox AI simulation instance."
  (%make-quantum-super-ai
   :memory '()
   :knowledge-base (make-hash-table :test #'equal)
   :performance-log '()
   :state-space (loop repeat 12 collect (random-between 0.0 1.0))
   :learning-rate 0.1
   :iteration 0
   :sandbox-ledger-balance (random-between 15000.0 85000.0)
   :sandbox-asset-balance (random-between 5000.0 30000.0)
   :sandbox-node-id (make-sandbox-id "LEDGER" (get-universal-time))
   :sandbox-wallet-id (make-sandbox-id "WALLET" (random 1000000 *demo-random-state*) 20)
   :risk-log '()))

(defun format-currency (value)
  "Format numeric values as USD with 2 decimal places."
  (format nil "$~,2F" value))

(defun bounded-state (value)
  "Keep simulated state-space values stable and easy to interpret."
  (min 1.0 (max 0.0 value)))

(defun record-risk (ai label severity detail)
  "Append a risk observation to the AI's diagnostic log."
  (push (list :iteration (quantum-super-ai-iteration ai)
              :label label
              :severity severity
              :detail detail)
        (quantum-super-ai-risk-log ai)))

(defun sandbox-ledger-network (ai)
  "Simulate a closed, fictional ledger update with no real banking connectivity."
  (let* ((drift (random-between -500.0 1200.0))
         (next-balance (max 0.0 (+ (quantum-super-ai-sandbox-ledger-balance ai) drift))))
    (setf (quantum-super-ai-sandbox-ledger-balance ai) next-balance)
    (when (< drift 0)
      (record-risk ai "ledger-drift" :medium "Sandbox ledger balance moved downward."))
    (list :network "FICTIONAL_SANDBOX_LEDGER"
          :node-id (quantum-super-ai-sandbox-node-id ai)
          :status "SIMULATION_ONLY"
          :balance (format-currency next-balance)
          :recent-drift (format nil "~:[+~;~]~A" (minusp drift) (format-currency drift)))))

(defun sandbox-asset-simulator (ai)
  "Manage a fictional asset pool and market drift for educational output."
  (let* ((fluctuation (random-between -0.035 0.045))
         (next-balance (* (quantum-super-ai-sandbox-asset-balance ai) (+ 1 fluctuation))))
    (setf (quantum-super-ai-sandbox-asset-balance ai) next-balance)
    (when (> (abs fluctuation) 0.03)
      (record-risk ai "asset-volatility" :low "Sandbox asset volatility exceeded the watch threshold."))
    (list :network "FICTIONAL_ASSET_POOL"
          :wallet-id (quantum-super-ai-sandbox-wallet-id ai)
          :balance-usd-value (format-currency next-balance)
          :market-shift (format nil "~:+,2F%%" (* 100 fluctuation)))))

(defun generate-demo-token (ai)
  "Generate a fake audit token that is explicitly unsuitable as a payment credential."
  (make-sandbox-id "AUDIT" (list (quantum-super-ai-iteration ai)
                                 (quantum-super-ai-sandbox-node-id ai)
                                 (get-universal-time))
                   24))

(defun quantum-ai (inputs)
  "Simulate probabilistic decision making."
  (let ((weighted-sum (reduce #'+ (mapcar (lambda (i) (* i (random-between 0.0 1.0))) inputs))))
    (tanh weighted-sum)))

(defun quantum-neural-system (states)
  "Process superposition-like states with bounded output."
  (mapcar (lambda (s) (bounded-state (abs (sin (* s (random-between 0.0 1.0)))))) states))

(defun quantum-learning-machine (ai)
  "Adjust internal state probabilities while keeping them bounded."
  (setf (quantum-super-ai-state-space ai)
        (mapcar (lambda (s)
                  (bounded-state (+ s (* (random-between -0.5 0.5)
                                         (quantum-super-ai-learning-rate ai)))))
                (quantum-super-ai-state-space ai))))

(defun quantum-optimization (ai)
  "Find current optimal state score."
  (reduce #'max (quantum-super-ai-state-space ai)))

(defun agi-core-system (ai input-data)
  "Central reasoning and memory write for the simulation."
  (let ((entry (format nil "Processed sandbox request: ~A" input-data)))
    (push entry (quantum-super-ai-memory ai))
    (setf (gethash (quantum-super-ai-iteration ai) (quantum-super-ai-knowledge-base ai)) entry)
    entry))

(defun recursive-cognitive-architecture (ai)
  "Self-tune the learning rate conservatively and advance the iteration counter."
  (setf (quantum-super-ai-learning-rate ai)
        (max 0.02 (* (quantum-super-ai-learning-rate ai) 0.985)))
  (incf (quantum-super-ai-iteration ai)))

(defun predictive-intelligence-framework (ai)
  "Predict a future state estimate from the current state-space average."
  (let* ((states (quantum-super-ai-state-space ai))
         (average (/ (reduce #'+ states) (length states))))
    (* average (random-between 0.85 1.15))))

(defun meta-intelligence-system (ai)
  "Evaluate and log system performance."
  (let* ((states (quantum-super-ai-state-space ai))
         (average (/ (reduce #'+ states) (length states)))
         (peak (quantum-optimization ai))
         (score (/ (+ average peak) 2.0)))
    (push score (quantum-super-ai-performance-log ai))
    score))

(defun summarize-ai (ai)
  "Return a plist summary useful for tests or callers embedding the simulation."
  (list :iteration (quantum-super-ai-iteration ai)
        :memory-count (length (quantum-super-ai-memory ai))
        :risk-count (length (quantum-super-ai-risk-log ai))
        :learning-rate (quantum-super-ai-learning-rate ai)
        :latest-score (first (quantum-super-ai-performance-log ai))))

(defun print-risk-log (ai)
  "Print the latest risk observations, if any."
  (if (quantum-super-ai-risk-log ai)
      (dolist (risk (reverse (subseq (quantum-super-ai-risk-log ai)
                                     0
                                     (min 3 (length (quantum-super-ai-risk-log ai))))))
        (format t "~% -> ~A [~A]: ~A"
                (getf risk :label)
                (getf risk :severity)
                (getf risk :detail)))
      (format t "~% -> No risk alerts in this cycle.")))

(defun run-cycle (ai input-data)
  "Run one full cognition + sandbox finance cycle."
  (format t "~%=============================================")
  (format t "~%  QUANTUM SUPER AI SANDBOX CYCLE")
  (format t "~%=============================================")

  (format t "~%[COGNITION]")
  (format t "~% -> ~A" (agi-core-system ai input-data))

  (let ((q-states (quantum-neural-system (quantum-super-ai-state-space ai))))
    (format t "~% -> Quantum Decision Value: ~,4F" (quantum-ai q-states))
    (format t "~% -> Predictive State Forecast: ~,4F"
            (predictive-intelligence-framework ai))
    (format t "~% -> Optimization Peak: ~,4F" (quantum-optimization ai)))

  (format t "~%~%[SANDBOX LEDGER]")
  (let ((ledger-data (sandbox-ledger-network ai)))
    (format t "~% -> Ledger Balance: ~A (~A)"
            (getf ledger-data :balance)
            (getf ledger-data :recent-drift))
    (format t "~% -> Ledger Node:    ~A | ~A"
            (getf ledger-data :node-id)
            (getf ledger-data :status)))

  (let ((asset-data (sandbox-asset-simulator ai)))
    (format t "~% -> Asset Wallet:   ~A"
            (getf asset-data :wallet-id))
    (format t "~% -> Asset Balance:  ~A [Shift: ~A]"
            (getf asset-data :balance-usd-value)
            (getf asset-data :market-shift)))

  (format t "~% -> Demo Audit ID:  ~A (not a credential)"
          (generate-demo-token ai))

  (quantum-learning-machine ai)
  (recursive-cognitive-architecture ai)
  (let ((score (meta-intelligence-system ai)))
    (format t "~%~%[SYSTEM DIAGNOSTICS]")
    (format t "~% -> Cycle Optimization Score: ~,4F" score)
    (format t "~% -> Learning Rate Now: ~,4F" (quantum-super-ai-learning-rate ai))
    (format t "~% -> Iteration: ~D" (quantum-super-ai-iteration ai))
    (print-risk-log ai))

  (format t "~%=============================================~%")
  (summarize-ai ai))

(defun run-demo (&optional (cycles 3))
  "Run multiple demo cycles."
  (let ((ai (create-quantum-super-ai)))
    (dotimes (i cycles)
      (run-cycle ai
                 (format nil "Sandbox scenario #~D" (1+ i))))
    (summarize-ai ai)))

;; Run 3 cycles when executed as a script.
(when *load-pathname*
  (run-demo 3))
