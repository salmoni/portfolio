(function () {
    "use strict";

    function initialiseCaseStudyLightbox() {
        if (typeof GLightbox !== "function") {
            return;
        }

        const galleryName = `case-study-${window.location.pathname
            .split("/")
            .pop()
            .replace(/\.html$/i, "")}`;

        const images = Array.from(document.querySelectorAll("img:not([data-no-lightbox])"));

        images.forEach((image) => {
            if (image.closest("a") || image.dataset.noLightbox !== undefined) {
                return;
            }

            const figure = image.closest("figure");
            const caption = figure?.querySelector("figcaption") ||
                (image.nextElementSibling?.tagName === "FIGCAPTION" ? image.nextElementSibling : null);
            const captionText = caption?.textContent.trim();
            const alternativeText = image.getAttribute("alt")?.trim();
            const accessibleDescription = captionText || alternativeText || "case-study image";

            const trigger = document.createElement("a");
            trigger.href = image.getAttribute("src").replace(/\\/g, "/");
            trigger.className = "glightbox case-study-lightbox";
            trigger.dataset.gallery = galleryName;
            trigger.dataset.type = "image";
            trigger.dataset.alt = alternativeText || accessibleDescription;
            trigger.setAttribute("aria-haspopup", "dialog");
            trigger.setAttribute("aria-label", `Open full-size image: ${accessibleDescription}`);

            if (caption) {
                trigger.dataset.description = caption.innerHTML.trim();
            }

            image.parentNode.insertBefore(trigger, image);
            trigger.appendChild(image);
        });

        if (!document.querySelector(".case-study-lightbox")) {
            return;
        }

        let lastTrigger = null;
        let focusTrap = null;
        const triggers = document.querySelectorAll(".case-study-lightbox");

        triggers.forEach((trigger) => {
            trigger.addEventListener("click", () => {
                lastTrigger = trigger;
            });
        });

        const lightbox = GLightbox({
            selector: ".case-study-lightbox",
            descPosition: "bottom",
            touchNavigation: true,
            keyboardNavigation: true,
            loop: false,
            moreLength: 0
        });

        lightbox.on("open", () => {
            window.requestAnimationFrame(() => {
                const dialog = document.querySelector(".glightbox-container");
                const closeButton = dialog?.querySelector(".gclose");

                if (!dialog) {
                    return;
                }

                dialog.setAttribute("role", "dialog");
                dialog.setAttribute("aria-modal", "true");
                dialog.setAttribute("aria-label", "Case-study image viewer");

                focusTrap = (event) => {
                    if (event.key !== "Tab") {
                        return;
                    }

                    const focusable = Array.from(dialog.querySelectorAll(
                        "button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])"
                    )).filter((element) => element.getClientRects().length > 0);

                    if (!focusable.length) {
                        return;
                    }

                    const first = focusable[0];
                    const last = focusable[focusable.length - 1];

                    if (event.shiftKey && document.activeElement === first) {
                        event.preventDefault();
                        last.focus();
                    } else if (!event.shiftKey && document.activeElement === last) {
                        event.preventDefault();
                        first.focus();
                    }
                };

                document.addEventListener("keydown", focusTrap);
                closeButton?.focus();
            });
        });

        lightbox.on("close", () => {
            if (focusTrap) {
                document.removeEventListener("keydown", focusTrap);
                focusTrap = null;
            }

            lastTrigger?.focus();
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialiseCaseStudyLightbox);
    } else {
        initialiseCaseStudyLightbox();
    }
})();
