import { useState } from 'react'
import Select, { components, MultiValue } from 'react-select'
import { CURRENTLY_USED_TAGS } from '../../../../utils/SettingsUtils'
import Tooltip from '../../../Tooltip/Tooltip'
import HelpIcon from '@mui/icons-material/Help'

interface Props {
    defaultTags: string[]
    onTagsChange(tags: string[])
}

const customSelectStyle = {
    option: provided => ({
        ...provided,
        color: 'black'
    })
}

const MultiValueContainer = props => {
    return (
        <components.MultiValueContainer {...props}>
            <Tooltip
                type={'hover'}
                content={<span style={props.innerProps.css}>{props.children}</span>}
                tooltipContent={<span>{props.data.description}</span>}
            />
        </components.MultiValueContainer>
    )
}

function TagSelect(props: Props) {
    let [tagOptions, setTagOptions] = useState(
        props.defaultTags
            ? props.defaultTags.slice().map(value => {
                  return { value, label: value }
              })
            : []
    )

    function onTagsChange(
        value: MultiValue<{
            value: string
            label: string
        }>
    ) {
        let newTags = value.map(option => option.value)
        let newTagOptions = [...value]
        setTagOptions(newTagOptions)
        props.onTagsChange(newTags)
    }

    function getAllUsedOptions(): MultiValue<{
        value: string
        label: string
    }> {
        let items = localStorage.getItem(CURRENTLY_USED_TAGS)
        if (!items) {
            return []
        }
        return JSON.parse(items).map(item => {
            return {
                value: item,
                label: item
            }
        })
    }

    return (
        <div>
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="finders">
                    Tags{' '}
                    <Tooltip
                        type="hover"
                        content={<HelpIcon style={{ color: '#007bff', cursor: 'pointer' }} />}
                        tooltipContent={
                            <span>
                                Tags are used for you to organize your restrictions and to make it easier to search for specific entries. Tags don't influence
                                what flips are shown.
                            </span>
                        }
                    />
                </label>
                <Select
                    isMulti
                    options={getAllUsedOptions()}
                    value={tagOptions}
                    styles={customSelectStyle}
                    closeMenuOnSelect={false}
                    components={{ MultiValueContainer }}
                    onChange={onTagsChange}
                />
            </div>
        </div>
    )
}

export default TagSelect
