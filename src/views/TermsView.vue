<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouteLeave } from '@/composables/useRouteLeave'
import SharedIntro from '@/components/shared/SharedIntro.vue'
import UiTabs from '@/components/ui/UiTabs.vue'
import UiContent from '@/components/ui/UiContent.vue'

const tabs = [
  { label: 'Terms of Service', value: 'terms' },
  { label: 'Privacy Policy', value: 'privacy' },
]

const activeTab = ref('terms')

const leaving = useRouteLeave()
const contentStyle = computed(() => ({
  animation: leaving.value ? 'superbird-fade-out 0.25s ease both' : 'superbird-fade-in 0.4s ease 120ms both',
}))
</script>

<template>
  <SharedIntro
    title="Legal"
    description="Terms of service and privacy policy for Superbird."
  />

  <div :style="contentStyle">
    <UiTabs v-model="activeTab" :tabs="tabs">

      <template #terms>
        <UiContent>
          <p>Last updated: March 2026</p>

          <div>
            <h2 class="text-sm font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using Superbird ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
          </div>

          <div>
            <h2 class="text-sm font-semibold text-foreground mb-2">2. Description of Service</h2>
            <p>Superbird is a free, browser-based toolkit for frontend developers. It provides tools to audit website performance, compress images, inspect DNS records, and test API endpoints. All processing happens client-side where possible.</p>
          </div>

          <div>
            <h2 class="text-sm font-semibold text-foreground mb-2">3. Use of the Service</h2>
            <p>You agree to use the Service only for lawful purposes. You must not use it to target systems you do not own or have explicit permission to test, nor to send abusive or malicious requests to third-party services.</p>
          </div>

          <div>
            <h2 class="text-sm font-semibold text-foreground mb-2">4. Third-Party APIs</h2>
            <p>Some features rely on third-party APIs (e.g. Google PageSpeed Insights, DNS resolvers). Your use of those features is subject to the respective third-party terms. Superbird is not responsible for the availability or accuracy of third-party data.</p>
          </div>

          <div>
            <h2 class="text-sm font-semibold text-foreground mb-2">5. Disclaimer of Warranties</h2>
            <p>The Service is provided "as is" without warranties of any kind. We do not guarantee that results are accurate, complete, or suitable for any particular purpose. Use audit results as a guide, not a definitive assessment.</p>
          </div>

          <div>
            <h2 class="text-sm font-semibold text-foreground mb-2">6. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, Superbird and its author shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
          </div>

          <div>
            <h2 class="text-sm font-semibold text-foreground mb-2">7. Changes to Terms</h2>
            <p>We may update these terms at any time. Continued use of the Service after changes constitutes acceptance of the revised terms.</p>
          </div>
        </UiContent>
      </template>

      <template #privacy>
        <UiContent>
          <p>Last updated: March 2026</p>

          <div>
            <h2 class="text-sm font-semibold text-foreground mb-2">1. What We Collect</h2>
            <p>Superbird does not collect personal information. We do not require an account, do not store your inputs, and do not track individual users. URLs and domains you enter are sent to third-party APIs solely to fulfill your request.</p>
          </div>

          <div>
            <h2 class="text-sm font-semibold text-foreground mb-2">2. Image Processing</h2>
            <p>Image compression is performed entirely in your browser using the Canvas API. Your images are never uploaded to any server. They leave your device only if you explicitly download the processed output.</p>
          </div>

          <div>
            <h2 class="text-sm font-semibold text-foreground mb-2">3. Third-Party Services</h2>
            <p>When you use the Audit feature, your URL is sent to the Google PageSpeed Insights API. When you use the DNS checker, your domain is sent to a public DNS-over-HTTPS resolver. These services have their own privacy policies which we encourage you to review.</p>
          </div>

          <div>
            <h2 class="text-sm font-semibold text-foreground mb-2">4. Analytics</h2>
            <p>We may use privacy-respecting, cookieless analytics to understand aggregate usage patterns (e.g. which tools are most used). No personally identifiable information is collected or stored.</p>
          </div>

          <div>
            <h2 class="text-sm font-semibold text-foreground mb-2">5. Cookies</h2>
            <p>Superbird does not use cookies for tracking. Local storage may be used to persist your preferences (e.g. dark mode, last used settings) entirely on your device.</p>
          </div>

          <div>
            <h2 class="text-sm font-semibold text-foreground mb-2">6. Contact</h2>
            <p>If you have questions about privacy, you can reach us at <a href="mailto:hello@frvncois.com" class="text-foreground underline underline-offset-2">hello@frvncois.com</a>.</p>
          </div>
        </UiContent>
      </template>

    </UiTabs>
  </div>
</template>
