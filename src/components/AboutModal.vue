<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import SuperbirdIcon from '@/assets/SuperbirdIcon.vue'
import { useAboutModal } from '@/composables/useAboutModal'
import { useLenis } from '@/composables/useLenis'

const { isOpen, close } = useAboutModal()

watch(isOpen, (open) => {
  const lenis = useLenis()
  if (!lenis) return
  open ? lenis.stop() : lenis.start()
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

const privacy = [
  'No uploads — everything runs in your browser',
  'No account, no login, no tracking',
  'No cookies, no fingerprinting',
  'I genuinely do not care about your data',
]
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-start justify-end p-6"
      style="background: rgba(0,0,0,0.12); backdrop-filter: blur(10px);"
      @click.self="close"
    >
      <!-- Panel -->
      <div
        data-lenis-prevent
        class="w-full rounded-2xl overflow-y-auto bg-background relative"
        style="max-width: 400px; max-height: calc(100vh - 48px); box-shadow: 0 8px 60px rgba(0,0,0,0.12); animation: superbird-modal-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;"
      >
        <!-- Close -->
        <button
          class="absolute top-4 right-4 p-1.5 rounded-lg text-secondary hover:text-foreground hover:bg-foreground/5 transition-colors cursor-pointer"
          @click="close"
        >
          <XMarkIcon class="size-4" />
        </button>

        <div class="p-7">

          <!-- Header -->
          <div class="flex items-center gap-3.5 mb-8">
            <div class="size-11 rounded-xl flex items-center justify-center shrink-0 bg-icon-bg text-icon-txt p-2.5">
              <SuperbirdIcon />
            </div>
            <div>
              <div class="text-sm font-semibold">Superbird</div>
              <div class="text-xs text-foreground/60 mt-0.5">Free · client-side · no account</div>
            </div>
          </div>

          <!-- What it is -->
          <div class="mb-6">
            <p class="text-[10px] font-semibold uppercase tracking-widest text-foreground/60 mb-2.5">What it is</p>
            <p class="text-xs leading-relaxed text-foreground">
              A free toolkit for frontend developers. Audit site performance with Lighthouse, compress images directly in your browser, inspect DNS propagation, and test API endpoints — all in one place, all without creating an account or uploading anything.
            </p>
          </div>

          <!-- The name -->
          <div class="mb-6">
            <p class="text-[10px] font-semibold uppercase tracking-widest text-foreground/60 mb-2.5">The name</p>
            <p class="text-xs leading-relaxed text-foreground">
              I'm French-Canadian and I literally cannot pronounce "Superbird" correctly and that makes me laugh. That's the whole reason. There is no deeper meaning.
            </p>
          </div>

          <div class="h-px bg-border my-6" />

          <!-- Privacy -->
          <div class="mb-6">
            <p class="text-[10px] font-semibold uppercase tracking-widest text-foreground/60 mb-3">Privacy</p>
            <div class="rounded-xl border bg-foreground/[0.02] p-3 flex flex-col gap-2.5">
              <div v-for="item in privacy" :key="item" class="flex items-center gap-3">
                <div class="size-4 rounded-full shrink-0 flex items-center justify-center" style="background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3);">
                  <CheckIcon class="size-2.5 text-success stroke-[2.5]" />
                </div>
                <p class="text-xs text-foreground">{{ item }}</p>
              </div>
            </div>
          </div>

          <div class="h-px bg-border my-6" />

          <!-- Coffee -->
          <div class="mb-6">
            <a
              href="https://donate.stripe.com/3cIfZhce21J07Wu3uBc3m01"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-center w-full h-10 rounded-xl text-sm transition-opacity hover:opacity-85"
              style="background: var(--color-coffee); color: var(--color-foreground);"
            >
              Buy me a coffee?
            </a>
          </div>

          <!-- Footer -->
          <div class="flex flex-col items-center justify-center gap-1 text-[10px] text-foreground/60 font-mono uppercase">
            <span>Made with ❤ in Montreal</span>
            <div class="">
              <a href="mailto:hello@frvncois.com" target="_blank" rel="noopener noreferrer" class="hover:text-secondary transition-colors">
                hello@frvncois.com
              </a>
              <span>·</span>
              <a href="https://frvncois.com" target="_blank" rel="noopener noreferrer" class="hover:text-secondary transition-colors">
                frvncois.com
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  </Transition>
</template>
