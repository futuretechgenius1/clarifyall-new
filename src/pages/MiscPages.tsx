import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const AboutPage: React.FC = () => (
  <div className="max-w-3xl mx-auto space-y-6">
    <SEOHead
      title="About ClarifyAll – AI. Made Clear."
      description="The story and engineering philosophy behind ClarifyAll: fast, private, free online productivity utilities for creators, students, and developers."
      canonical="https://clarifyall.com/about"
    />
    <Breadcrumbs items={[{ label: 'About' }]} />
    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">About ClarifyAll</h1>
    <div className="prose prose-slate dark:prose-invert text-sm leading-relaxed space-y-4">
      <p className="text-base text-slate-600 dark:text-slate-300">
        ClarifyAll was born out of frustration with bloated online file converters covered in spam ads, mandatory registrations, and slow paywalls.
      </p>
      <p>
        Our mission is straightforward: <strong>AI. Made Clear.</strong> We build clean, high-performance web utilities that run directly in your browser or through secure, temporary server processing.
      </p>
      <h2 className="text-lg font-bold">Our Core Commitments</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>No Mandatory Signups:</strong> Complete your task in seconds without verifying an email or creating a password.</li>
        <li><strong>Mobile-First Engineering:</strong> Everything is designed to work seamlessly on touchscreen phones.</li>
        <li><strong>Privacy Respect:</strong> Your documents are never kept for data harvesting or advertising profiling.</li>
      </ul>
    </div>
  </div>
);

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && message) {
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <SEOHead
        title="Contact Us & Feedback | ClarifyAll"
        description="Get in touch with the ClarifyAll team for tool requests, feedback, or technical support."
        canonical="https://clarifyall.com/contact"
      />
      <Breadcrumbs items={[{ label: 'Contact' }]} />
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Contact &amp; Support</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Have a feature suggestion, bug report, or partnership inquiry? We would love to hear from you.
      </p>

      {submitted ? (
        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Message Received</h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Thank you for reaching out! Our team will review your note and respond within 24 hours.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Your Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Feature suggestion, bug report, inquiry..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Message *
            </label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="How can we assist you?"
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors min-h-[44px]"
          >
            Send Inquiry
          </button>
        </form>
      )}
    </div>
  );
};

export const NotFoundPage: React.FC = () => (
  <div className="max-w-md mx-auto py-24 text-center space-y-4">
    <SEOHead title="404 Page Not Found | ClarifyAll" description="The requested page could not be located on ClarifyAll." />
    <span className="text-6xl font-extrabold text-indigo-600">404</span>
    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Page Not Found</h1>
    <p className="text-xs sm:text-sm text-slate-500">
      The utility or page you were looking for doesn't exist or has moved.
    </p>
    <div className="pt-2">
      <Link
        to="/"
        className="inline-block px-5 py-2.5 bg-indigo-600 text-white text-xs sm:text-sm font-semibold rounded-xl"
      >
        Return to Homepage
      </Link>
    </div>
  </div>
);

export const ServerErrorPage: React.FC = () => (
  <div className="max-w-md mx-auto py-24 text-center space-y-4">
    <SEOHead title="500 Internal Server Error | ClarifyAll" description="An error occurred while processing your request." />
    <span className="text-6xl font-extrabold text-red-500">500</span>
    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Error</h1>
    <p className="text-xs sm:text-sm text-slate-500">
      We encountered an unexpected server issue. Please try your operation again shortly.
    </p>
    <div className="pt-2">
      <Link
        to="/"
        className="inline-block px-5 py-2.5 bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl"
      >
        Back to Safety
      </Link>
    </div>
  </div>
);
