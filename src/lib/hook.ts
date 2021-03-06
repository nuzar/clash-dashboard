import { Draft } from 'immer'
import { useImmer } from 'use-immer'
import { useRef, useEffect, useState, useMemo, useCallback } from 'react'

import { noop } from '@lib/helper'

export function useObject<T extends Record<string, unknown>> (initialValue: T) {
    const [copy, rawSet] = useImmer(initialValue)

    function set<K extends keyof Draft<T>> (key: K, value: Draft<T>[K]): void
    function set<K extends keyof Draft<T>> (data: Partial<T>): void
    function set<K extends keyof Draft<T>> (f: (draft: Draft<T>) => void | T): void
    function set<K extends keyof Draft<T>> (data: any, value?: Draft<T>[K]): void {
        if (typeof data === 'string') {
            rawSet(draft => {
                const key = data as K
                const v = value
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                draft[key] = v!
            })
        } else if (typeof data === 'function') {
            rawSet(data)
        } else if (typeof data === 'object') {
            rawSet((draft: Draft<T>) => {
                const obj = data as Draft<T>
                for (const key of Object.keys(obj)) {
                    const k = key as keyof Draft<T>
                    draft[k] = obj[k]
                }
            })
        }
    }

    return [copy, useCallback(set, [rawSet])] as [T, typeof set]
}

export function useInterval (callback: () => void, delay: number) {
    const savedCallback = useRef(noop)

    useEffect(() => {
        savedCallback.current = callback
    }, [callback])

    useEffect(
        () => {
            const handler = () => savedCallback.current()

            if (delay !== null) {
                const id = setInterval(handler, delay)
                return () => clearInterval(id)
            }
        },
        [delay]
    )
}

export function useRound<T> (list: T[], defidx = 0) {
    if (list.length < 2) {
        throw new Error('List requires at least two elements')
    }

    const [state, setState] = useState(defidx)

    function next () {
        setState((state + 1) % list.length)
    }

    const current = useMemo(() => list[state], [state])

    return { current, next }
}

export function useVisible (initial = false) {
    const [visible, setVisible] = useState(initial)

    function hide () {
        setVisible(false)
    }

    function show () {
        setVisible(true)
    }
    return { visible, hide, show }
}
