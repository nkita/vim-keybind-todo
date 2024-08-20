import { Combobox, ComboboxOption, ComboboxOptions, ComboboxButton, ComboboxInput } from '@headlessui/react'
import React, { useState, forwardRef } from 'react'
import { ChevronsUpDown } from "lucide-react"
import { ControllerRenderProps } from 'react-hook-form'
import { Badge } from './badge'
import { CheckCircledIcon, CheckIcon, CircleIcon } from '@radix-ui/react-icons'
type SearchProps = {
    items: string[]
    autoFocus: any
    placeholder: string
    tabIndex?: number
    addItem: (label: string) => void
    autoSave: boolean
    // deleteItem: (id: number) => void
}

interface SearchSelectProps
    extends ControllerRenderProps,
    SearchProps { }
const DynamicSearchSelect = forwardRef<HTMLInputElement, SearchSelectProps>(
    ({
        items,
        value,
        autoFocus,
        placeholder,
        tabIndex = 0,
        addItem,
        autoSave = true,
        // deleteItem,
        ...props
    }, ref) => {
        const [query, setQuery] = useState('')
        const filteredItems =
            query === ''
                ? items
                : items.filter((item: string) => {
                    return (
                        item.toLowerCase()
                            .replace(/\s+/g, '')
                            .includes(query.toLowerCase().replace(/\s+/g, ''))
                    )
                })
        return (
            <Combobox value={value}>
                <div className="relative mt-1">
                    <div className="relative w-full">
                        <ComboboxInput tabIndex={tabIndex} ref={ref} displayValue={(item: string) => item} onChange={(event) => setQuery(event.target.value)} autoFocus={autoFocus} placeholder={placeholder}
                            className="" />
                        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronsUpDown
                                className="ml-2 shrink-0 opacity-500"
                                aria-hidden="true"
                            />
                        </ComboboxButton>
                    </div>
                    <ComboboxOptions className="absolute p-3 border border-input my-2 max-h-60 w-full overflow-auto rounded-md text-popover-foreground bg-popover z-50 shadow-lg text-sm" >
                        {!query && items.length === 0 ? (
                            <div className="relative cursor-default text-sm">
                                {"🐾 データが見つかりません。"}
                            </div>

                        ) : (
                            <>
                                {filteredItems.length === 0 ? (
                                    <ComboboxOption value={query} className={({ active }) =>
                                        `relative cursor-default select-none py-2 px-4  ${active ? 'bg-accent text-accent-foreground cursor-pointer' : ''} rounded-md`
                                    }>
                                        <div className='flex justify-between items-center'>
                                            <span className='font-bold truncate flex gap-1'>{query}</span><span className='text-xs text-muted-foreground'>{autoSave ? "" : "*編集中は自動保存されません"}</span>
                                        </div>
                                    </ComboboxOption>
                                ) : (
                                    filteredItems.map((item: any) => {
                                        return (
                                            <div key={item} className={`relative flex items-center`}>
                                                <ComboboxOption value={item.emoji + item.label} className={({ active }) =>
                                                    `relative cursor-default select-none py-2 pl-4 pr-4  w-full ${active ? ' bg-accent text-accent-foreground cursor-pointer' : ''} rounded-md`
                                                }>
                                                    <div className='flex justify-between items-center'>
                                                        <div className='flex justify-between align-middle font-bold items-center w-full'>
                                                            <span>{item.emoji}{item.label}</span><Badge className='text-xs' variant={"default"}>{"保存済"}</Badge>
                                                        </div>
                                                        <div className={'font-light text-xs text-muted-foreground'}>
                                                            {item.description}
                                                        </div>
                                                    </div>
                                                </ComboboxOption>
                                            </div>
                                        )
                                    })
                                )}
                            </>
                        )}
                    </ComboboxOptions>
                </div>
            </Combobox >
        )
    }
)

DynamicSearchSelect.displayName = "DynamicSearchSelect"
export { DynamicSearchSelect }