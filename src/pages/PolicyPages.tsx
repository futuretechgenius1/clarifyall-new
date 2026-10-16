import React from 'react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const PrivacyPolicyPage: React.FC = () => (
  <div className="max-w-3xl mx-auto space-y-6">
    <SEOHead
      title="Privacy Policy | ClarifyAll"
      description="Learn how ClarifyAll handles your data. Zero permanent storage for uploaded documents, encrypted transport, and strict privacy controls."
      canonical="https://clarifyall.com/privacy-policy"
    />
    <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Privacy Policy</h1>
    <p className="text-xs text-slate-400">Last updated: January 2026</p>
    <div className="prose prose-slate dark:prose-invert text-sm leading-relaxed space-y-4">
      <h2 className="text-lg font-bold">1. Document Processing &amp; Data Retention</h2>
      <p>ClarifyAll operates on a strict minimization principle. When you use tools such as our PDF Compressor, PDF Merger, or Image to Text OCR, files are processed exclusively in volatile system memory (RAM). We do not retain, catalog, or archive user documents after processing concludes.</p>
      <h2 className="text-lg font-bold">2. Local Browser-Executed Utilities</h2>
      <p>Certain utilities—including our Word Counter, Text Formatter, and client-side Image Resizer—execute completely inside your device's web browser using local APIs. Your text and images for these tools never touch our backend servers.</p>
      <h2 className="text-lg font-bold">3. Artificial Intelligence Queries</h2>
      <p>When you use AI tools (such as our AI Email Writer or Text Summarizer), your prompts are securely transmitted via encrypted TLS connections to enterprise foundation model endpoints. In accordance with standard developer terms, prompt content is not retained or used for public training.</p>
    </div>
  </div>
);

export const TermsPage: React.FC = () => (
  <div className="max-w-3xl mx-auto space-y-6">
    <SEOHead
      title="Terms of Service | ClarifyAll"
      description="Terms of service and acceptable use policy for ClarifyAll online utilities."
      canonical="https://clarifyall.com/terms"
    />
    <Breadcrumbs items={[{ label: 'Terms of Service' }]} />
    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Terms of Service</h1>
    <p className="text-xs text-slate-400">Last updated: January 2026</p>
    <div className="prose prose-slate dark:prose-invert text-sm leading-relaxed space-y-4">
      <h2 className="text-lg font-bold">1. Acceptance of Terms</h2>
      <p>By accessing or using ClarifyAll.com, you agree to comply with these terms. If you do not agree, please discontinue using the utilities immediately.</p>
      <h2 className="text-lg font-bold">2. Acceptable Use</h2>
      <p>You agree not to upload malicious software, archive bombs, illicit materials, or attempt to overwhelm system endpoints through denial-of-service automation.</p>
      <h2 className="text-lg font-bold">3. Disclaimer of Warranties</h2>
      <p>ClarifyAll tools are provided on an "as-is" and "as-available" basis without warranties of any kind. You are solely responsible for reviewing AI-generated drafts and verifying career or business communications.</p>
    </div>
  </div>
);

export const CookiePolicyPage: React.FC = () => (
  <div className="max-w-3xl mx-auto space-y-6">
    <SEOHead
      title="Cookie Policy | ClarifyAll"
      description="Details regarding cookie usage, local storage preferences, and tracking prevention on ClarifyAll."
      canonical="https://clarifyall.com/cookie-policy"
    />
    <Breadcrumbs items={[{ label: 'Cookie Policy' }]} />
    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Cookie Policy</h1>
    <div className="prose prose-slate dark:prose-invert text-sm leading-relaxed space-y-4">
      <p>ClarifyAll uses local browser storage strictly for functional preferences (such as maintaining your light or dark mode theme selection). We do not deploy invasive cross-site tracking cookies.</p>
    </div>
  </div>
);

export const EditorialPolicyPage: React.FC = () => (
  <div className="max-w-3xl mx-auto space-y-6">
    <SEOHead
      title="Editorial Policy & Standards | ClarifyAll"
      description="Our commitments to objective reviews, original research, and fact-checked technological tutorials."
      canonical="https://clarifyall.com/editorial-policy"
    />
    <Breadcrumbs items={[{ label: 'Editorial Policy' }]} />
    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Editorial Policy</h1>
    <div className="prose prose-slate dark:prose-invert text-sm leading-relaxed space-y-4">
      <p>ClarifyAll maintains rigorous standards for published guides, software comparisons, and tutorials:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>No Unreviewed AI Generation:</strong> Every article is authored, fact-checked, and reviewed by subject matter experts.</li>
        <li><strong>Objective Testing:</strong> AI tool evaluations reflect verifiable benchmarks, latency tests, and documented limitations.</li>
        <li><strong>Independence:</strong> We do not accept payment to artificially rank software higher or obscure vendor drawbacks.</li>
      </ul>
    </div>
  </div>
);

export const AdvertisingPolicyPage: React.FC = () => (
  <div className="max-w-3xl mx-auto space-y-6">
    <SEOHead
      title="Advertising & Monetization Policy | ClarifyAll"
      description="Ethical standards for display advertising on ClarifyAll. No intrusive popups, no deceptive buttons."
      canonical="https://clarifyall.com/advertising-policy"
    />
    <Breadcrumbs items={[{ label: 'Advertising Policy' }]} />
    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Advertising Policy</h1>
    <div className="prose prose-slate dark:prose-invert text-sm leading-relaxed space-y-4">
      <p>ClarifyAll is committed to responsible, non-intrusive monetization that preserves user productivity:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Zero Deceptive Ads:</strong> We never display fake "Download" buttons or misleading popups designed to trick users.</li>
        <li><strong>Unobtrusive Placements:</strong> Advertisements are clearly labeled and placed below tool processing workflows so touch targets remain unobstructed.</li>
        <li><strong>Core Usability Guaranteed:</strong> All utilities remain 100% functional regardless of whether advertising is enabled or blocked.</li>
      </ul>
    </div>
  </div>
);
