"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import Select from "./Select";
import TextArea from "./TextArea";
import Button from "./Button";

const reportReasons = [
  { value: "scam", label: "Scam" },
  { value: "fake", label: "Fake product" },
  { value: "prohibited", label: "Prohibited item" },
  { value: "wrong-info", label: "Wrong information" },
  { value: "offensive", label: "Offensive content" },
  { value: "other", label: "Other" },
];

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  listingId: string;
}

const ReportModal: React.FC<ReportModalProps> = ({ open, onClose, listingId }) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;

    setSubmitting(true);
    try {
      await fetch(`/api/listings/${listingId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, reason, description }),
      });
      setSubmitted(true);
    } catch {
      console.error("Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setDescription("");
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Report Listing"
      footer={
        submitted ? (
          <Button onClick={handleClose} fullWidth>
            Close
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleClose} fullWidth>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={submitting}
              disabled={!reason}
              fullWidth
            >
              Submit Report
            </Button>
          </div>
        )
      }
    >
      {submitted ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Report Submitted</h3>
          <p className="text-sm text-gray-500">
            Thank you for your report. We will review it shortly.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <Select
            label="Reason for report"
            options={reportReasons}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Select a reason"
          />
          <TextArea
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide additional details..."
            rows={4}
            maxLength={500}
            showCount
          />
        </div>
      )}
    </Modal>
  );
};

export default ReportModal;
