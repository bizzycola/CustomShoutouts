import type { Ref } from 'vue'
import { useStorage } from '@vueuse/core'

export const account = useStorage('account', null) as Ref
export const accessToken = useStorage('accessToken', null) as Ref
