(function () {
  const verificationCache = new Map();

  function isVerifiedStatus(data) {
    return Boolean(
      data &&
      (data.isVerified === true || data.affiliation === 'student_verified')
    );
  }

  async function fetchVerificationStatus(userId) {
    if (!userId) {
      return { isVerified: false, affiliation: null };
    }

    if (verificationCache.has(userId)) {
      return verificationCache.get(userId);
    }

    try {
      const response = await fetch(`https://uni-verse-api.vercel.app/api/verification/status/${encodeURIComponent(userId)}`);
      const data = await response.json();

      const status = response.ok && data?.success
        ? {
            isVerified: isVerifiedStatus(data),
            affiliation: data.affiliation || null,
            raw: data,
          }
        : { isVerified: false, affiliation: null };

      verificationCache.set(userId, status);
      return status;
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
      const fallback = { isVerified: false, affiliation: null };
      verificationCache.set(userId, fallback);
      return fallback;
    }
  }

  function getVerifiedBadgeHtml() {
    return `
      <span class="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-700">
        <span aria-hidden="true" class="text-[10px] leading-none">✓</span>
        Student
      </span>
    `;
  }

  window.uniVerseVerification = {
    fetchVerificationStatus,
    getVerifiedBadgeHtml,
  };
})();