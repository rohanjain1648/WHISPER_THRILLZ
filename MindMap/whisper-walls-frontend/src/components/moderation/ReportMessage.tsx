import React, { useState } from 'react';
import { moderationService, ReportMessageRequest } from '../../services/moderationService';

interface ReportMessageProps {
  messageId: string;
  onReportSubmitted?: () => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export const ReportMessage: React.FC<ReportMessageProps> = ({
  messageId,
  onReportSubmitted,
  onCancel,
  onError,
  className = ''
}) => {
  const [selectedReason, setSelectedReason] = useState<ReportMessageRequest['reason'] | ''>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons: ReportMessageRequest['reason'][] = [
    'inappropriate',
    'spam',
    'harassment',
    'hate-speech',
    'violence',
    'other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReason) {
      if (onError) onError('Please select a reason for reporting');
      return;
    }

    try {
      setIsSubmitting(true);

      await moderationService.reportMessage({
        messageId,
        reason: selectedReason,
        description: description.trim() || undefined
      });

      if (onReportSubmitted) {
        onReportSubmitted();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit report';
      if (onError) onError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`report-message ${className}`}>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Message</h3>
          <p className="text-gray-600 text-sm">
            Help us keep the community safe by reporting inappropriate content
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Why are you reporting this message?
            </label>
            <div className="space-y-2">
              {reasons.map((reason) => (
                <label
                  key={reason}
                  className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value as ReportMessageRequest['reason'])}
                    className="mt-1 text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      {moderationService.getReasonDisplayText(reason)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {moderationService.getReasonDescription(reason)}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Additional details (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any additional context that might help our moderators..."
              maxLength={500}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
            <div className="text-xs text-gray-500 mt-1">
              {description.length}/500 characters
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedReason || isSubmitting}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Report</span>
              )}
            </button>
          </div>
        </form>

        {/* Disclaimer */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            Reports are reviewed by our moderation team. False reports may result in account restrictions.
            Thank you for helping maintain a positive community.
          </p>
        </div>
      </div>
    </div>
  );
};