(defvar nodemacs-debug t "Debug flag")
(setq node (start-process "my-process" "foo" "cat"))
(setq node-queue (tq-create node))
;;(set-process-filter node 'node-filter)

(defun ordinary-insertion-filter (proc string)
  (when (buffer-live-p (process-buffer proc))
    (with-current-buffer (process-buffer proc)
      (let ((moving (= (point) (process-mark proc))))
        (save-excursion
          ;; Insert the text, advancing the process marker.
          (goto-char (process-mark proc))
          (insert string)
          (set-marker (process-mark proc) (point)))
        (if moving (goto-char (process-mark proc)))))))

(defun node-filter (proc string)
  (when nodemacs-debug (ordinary-insertion-filter proc string))
  (message "%s" string)
  (delete-process node))

(defun handle-answer (closure answer)
  (message "%s" "here")
  (when 'nodemacs-debug (ordinary-insertion-filter node answer))
  (message "%s" answer)
  (delete-process node))

(defun nodemacs-send-query (msg)
  (message "%s" msg)
  (tq-enqueue node-queue msg "\n" nil 'handle-answer t))

(defun nodemacs-call (func-str &rest args)
  (let* ((json `(:type "callfunc" :funcname ,func-str :args ,args))
         (sending-msg (concat (json-encode json) "\n")))
    (nodemacs-send-query sending-msg))
  )


(nodemacs-call "dididada" 1 2 3)

;;(process-send-string node "hello world\n")

