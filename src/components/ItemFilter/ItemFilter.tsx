/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Badge, Button, Card, Form, Spinner } from 'react-bootstrap';
import './ItemFilter.css';
import { useLocation, useHistory } from "react-router-dom";
import api from '../../api/ApiHelper';
import { getItemFilterFromUrl } from '../../utils/Parser/URLParser';

interface Props {
    onFilterChange?(filter?: ItemFilter): void,
    disabled?: boolean
}

// Boolean if the component is mounted. Set to false in useEffect cleanup function
let mounted = true;

function ItemFilter(props: Props) {

    const enchantmentSelect = useRef(null);
    const levelSelect = useRef(null);
    const reforgeSelect = useRef(null);

    let [enchantments, setEnchantments] = useState<Enchantment[]>([]);
    let [reforges, setReforges] = useState<Reforge[]>([]);
    let [itemFilter, setItemFilter] = useState<ItemFilter>();
    let [expanded, setExpanded] = useState(false);
    let [isApplied, setIsApplied] = useState(false);

    let history = useHistory();
    let query = new URLSearchParams(useLocation().search);

    useEffect(() => {
        mounted = true;
        loadFilterItems();
        itemFilter = getItemFilterFromUrl(query);
        if (itemFilter) {
            setItemFilter(itemFilter);
            setExpanded(true);
        }
        return () => { mounted = false }
    }, []);

    history.listen(() => {
        setIsApplied(false);
    })

    let loadFilterItems = () => {
        api.getEnchantments().then(enchantments => {
            if (!mounted) {
                return;
            }
            api.getReforges().then(reforges => {
                if (!mounted) {
                    return;
                }
                setEnchantments(enchantments);
                setReforges(reforges);
                if (!itemFilter) {
                    setItemFilter({
                        enchantment: {
                            id: enchantments[0].id,
                            level: 1,
                            name: enchantments[0].name
                        },
                        reforge: {
                            id: reforges[0].id,
                            name: reforges[0].name
                        }
                    })
                }
            })
        })
    }

    let onReforgeChange = (event: ChangeEvent<HTMLSelectElement>) => {
        let selectedIndex = event.target.options.selectedIndex;
        let newFilter: ItemFilter = {
            enchantment: itemFilter?.enchantment,
            reforge: {
                id: parseInt(event.target.options[selectedIndex].getAttribute('data-id')!),
                name: event.target.value,
            }
        }

        setIsApplied(false);
        updateURLQuery(newFilter);
        setItemFilter(newFilter);
    }

    let onLevelChange = (newLevel: ChangeEvent) => {
        let newFilter: ItemFilter = {
            enchantment: {
                id: itemFilter?.enchantment?.id || 0,
                level: parseInt((newLevel.target as HTMLInputElement).value)
            },
            reforge: itemFilter?.reforge
        };

        setIsApplied(false);
        updateURLQuery(newFilter);
        setItemFilter(newFilter);
    }

    let onEnchantmentChange = (newEnchantment: ChangeEvent<HTMLSelectElement>) => {
        let selectedIndex = newEnchantment.target.options.selectedIndex;
        let newFilter: ItemFilter = {
            enchantment: {
                id: parseInt(newEnchantment.target.options[selectedIndex].getAttribute('data-id')!),
                name: newEnchantment.target.value,
                level: itemFilter?.enchantment?.level
            },
            reforge: itemFilter?.reforge
        };
        setIsApplied(false);
        updateURLQuery(newFilter);
        setItemFilter(newFilter);
    }

    let onFilterApply = () => {
        if (props.onFilterChange) {
            props.onFilterChange(itemFilter);
        }
        setIsApplied(true);
    }

    let onFilterRemove = () => {
        setExpanded(false);
        setItemFilter(undefined);
        if (props.onFilterChange) {
            props.onFilterChange(undefined);
        }
        updateURLQuery();
    }

    let onEnable = () => {
        setExpanded(true);
        if (!itemFilter) {
            itemFilter = {
                enchantment: enchantments[0]
            }
            setItemFilter(itemFilter);
        }
        updateURLQuery(itemFilter);
    }

    let updateURLQuery = (filter?: ItemFilter) => {
        history.push({
            pathname: history.pathname,
            search: filter ? '?itemFilter=' + btoa(JSON.stringify(filter)) : ''
        })
    }

    let isLevelSelectDisabled = () => {
        return itemFilter && itemFilter.enchantment && itemFilter.enchantment.name ? (itemFilter.enchantment.name.toLowerCase() === "none" || itemFilter.enchantment.name.toLowerCase() === "any") : false;
    }

    let enchantmentSelectList = enchantments.map(enchantment => {
        return (
            <option data-id={enchantment.id} key={enchantment.id} value={enchantment.name}>{enchantment.name}</option>
        )
    })

    let reforgeSelectList = reforges.map(reforge => {
        return (
            <option data-id={reforge.id} key={reforge.id} value={reforge.name}>{reforge.name}</option>
        )
    })

    return (
        <div className="enchantment-filter">
            {!expanded ?
                <div>
                    <a href="#" onClick={() => onEnable()}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-plus-circle" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                        </svg>
                        <span> Add Filter</span>
                    </a>
                </div> :
                <Card>
                    <Card.Title style={{ margin: "10px" }}>
                        Filter
                        {isApplied ?
                            <Badge variant="success" className="appliedBadge">Applied</Badge> :
                            <Badge variant="danger" className="appliedBadge">Not Applied</Badge>}
                    </Card.Title>
                    <Card.Body>
                        <Form inline style={{ marginBottom: "5px" }} >
                            <Form.Group>
                                {reforges.length > 0 ?
                                    <Form.Control className="reforge-filter-select-reforge" as="select" onChange={onReforgeChange} defaultValue={itemFilter?.reforge?.id} disabled={props.disabled} ref={reforgeSelect}>
                                        {reforgeSelectList}
                                    </Form.Control> :
                                    <Spinner animation="border" role="status" variant="primary" />
                                }
                            </Form.Group>
                            <Form.Group>
                                {enchantments.length > 0 ?
                                    <Form.Control className="enchantment-filter-select-enchantment" as="select" onChange={onEnchantmentChange} defaultValue={itemFilter?.enchantment!.id} disabled={props.disabled} ref={enchantmentSelect}>
                                        {enchantmentSelectList}
                                    </Form.Control> :
                                    <Spinner animation="border" role="status" variant="primary" />
                                }
                            </Form.Group>
                            <Form.Group>
                                <Form.Control as="select" onChange={onLevelChange} defaultValue={itemFilter?.enchantment?.level} disabled={props.disabled || isLevelSelectDisabled()} ref={levelSelect}>
                                    <option>1</option>
                                    <option>2</option>
                                    <option>3</option>
                                    <option>4</option>
                                    <option>5</option>
                                    <option>6</option>
                                    <option>7</option>
                                    <option>8</option>
                                    <option>9</option>
                                    <option>10</option>
                                </Form.Control>
                            </Form.Group>
                        </Form >
                        <div>
                            <Button className="btn-success" style={{ marginRight: "5px" }} onClick={() => onFilterApply()} disabled={props.disabled}>Apply</Button>
                            <Button className="btn-danger" onClick={() => onFilterRemove()} disabled={props.disabled}>Remove Filter</Button>
                        </div>
                    </Card.Body>
                </Card>
            }
        </div >
    )
}

export default ItemFilter;