            document.addEventListener('DOMContentLoaded', function() {
            const mobileMenuButton = document.getElementById('mobileMenuButton');
            const mobileMenu = document.getElementById('mobileMenu');
            const mobileOverlay = document.getElementById('mobileMenuOverlay');
            const closeBtn = document.getElementById('closeMobileMenu');

            function openMenu() {
                mobileMenu.classList.remove('-translate-x-full');
                mobileMenu.classList.add('translate-x-0');
                mobileOverlay.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
                mobileMenuButton.classList.add('active');
            }

            function closeMenu() {
                mobileMenu.classList.add('-translate-x-full');
                mobileMenu.classList.remove('translate-x-0');
                mobileOverlay.classList.add('hidden');
                document.body.style.overflow = '';
                mobileMenuButton.classList.remove('active');
            }

            mobileMenuButton.addEventListener('click', function(e) {
                e.stopPropagation();
                if (mobileMenu.classList.contains('-translate-x-full')) {
                    openMenu();
                } else {
                    closeMenu();
                }
            });

            closeBtn.addEventListener('click', closeMenu);
            mobileOverlay.addEventListener('click', closeMenu);

            // Close on escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && !mobileMenu.classList.contains('-translate-x-full')) {
                    closeMenu();
                }
            });

            // Close on link click
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', closeMenu);
            });

            // Prevent body scroll when menu is open
            const observer = new MutationObserver(() => {
                if (mobileMenu.classList.contains('translate-x-0')) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            });
            observer.observe(mobileMenu, { attributes: true, attributeFilter: ['class'] });
             });