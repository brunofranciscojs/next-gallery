"use client"
import Image from 'next/image.js';
import React, { useEffect, useState } from 'react';
import { getDownloadURL, listAll, ref, getMetadata, deleteObject } from "firebase/storage";
import { images } from './fireBaseData';
import { FastAverageColor } from 'fast-average-color';
import { useCategoria } from './Context';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import useAuth from "./useAuth";

const Mansonry = () => {
  
    const { logado } = useAuth();
    const { categoria } = useCategoria();
    const [files, setFiles] = useState([]);
    const [modal, setModal] = useState(false);
    const [colors, setColors] = useState({});
    const [confirmation, setConfirmation] = useState(false);
    const [currentCategoryImages, setCurrentCategoryImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0); 
    const [favorite, setFavorite] = useState({});
    const [viewFavs, setViewFaves] = useState(false)
    const [openFav, setOpenFav] = useState(false)
    const [modalFav, setModalFav] = useState('')
    const [delURL, setDelURL] = useState();
    const [delCat, setDelCat] = useState();
    
    useEffect(() => {
        const fetchUrls = async () => {
            const raizDB = await listAll(ref(images, '/'));
            const pastas = raizDB.prefixes.map((folderRef) => folderRef);
            const fetch = pastas.map(async (folderRef) => {
                const pasta = ref(images, folderRef.fullPath);
                const arquivos = await listAll(pasta);
                const urlsWithMetadata = await Promise.all(
                    arquivos.items.map(async (itemRef) => {
                        const url = await getDownloadURL(itemRef);
                        const metadata = await getMetadata(itemRef);
                        return { url, timeCreated: metadata.timeCreated };
                    })
                );
                return { cat: folderRef._location.path_, img: urlsWithMetadata };
            });
            const imagens = await Promise.all(fetch);

            imagens.forEach(pasta => {
                pasta.img.sort((a, b) => new Date(b.timeCreated) - new Date(a.timeCreated));
            });

            setFiles(imagens);
           
            const corDominante = new FastAverageColor();
            const colorPromises = imagens.flatMap(pasta =>
                pasta.img.map(async ({ url }) => {
                    const color = await corDominante.getColorAsync(url);
                    return { url, color: color.hex };
                })
            );
            const cores = await Promise.all(colorPromises);
            const mapaCores = cores.reduce((acc, { url, color }) => {
                acc[url] = color;
                return acc;
            }, {});
            setColors(mapaCores);
        };
        fetchUrls();
    }, []);

    
    useEffect(() => {
        const escFunction = (event) => { if (event.code === 'Escape') { setModal(false) }}
        document.addEventListener('keydown', escFunction);
        return () => document.removeEventListener('keydown', escFunction);
    }, []);

    const filtro = files.filter(file => file.cat.toLowerCase() === categoria);

    const abrirModal = (url, categoria) => {
        setModal(true);
        setCurrentCategoryImages(categoria);
        const clickedImageIndex = categoria.findIndex(image => image.url === url);
        setCurrentImageIndex(clickedImageIndex);
    };
    
    const dataUpload = (hour) => new Intl.DateTimeFormat('pt','BR').format(new Date(hour))


    useEffect(() => {
        if (typeof window !== 'undefined') {
            const favoritados = JSON.parse(localStorage.getItem('favoritos')) || {};
            setFavorite(favoritados);
        }
    }, []);

    const favoritar = (url) => {
        if (typeof window !== 'undefined') {
            setFavorite((prevFavorites) => {
                const updatedFavorites = { ...prevFavorites, [url]: !prevFavorites[url] };
                localStorage.setItem('favoritos', JSON.stringify(updatedFavorites));
                return updatedFavorites;
            });
        }
    };

    const favoriteModal = (item) =>{
        setOpenFav(true)
        setModalFav(item)
    }
    const excluirImg = async (url, categoria) => {
        const itemRef = ref(images, url);
        await deleteObject(itemRef);
        setFiles((arquivos) =>
            arquivos.map((pasta) => {
                if (pasta.cat === categoria) 
                return {...pasta, img: pasta.img.filter((img) => img.url !== url) };
                return pasta;
            })
        );
    };
    return (
        <>
            <button className='fixed md:right-12 right-[unset] left-5 md:left-[unset] top-[17px] z-50 [&>svg_path]:fill-gray-500 dark:[&>svg_path]:fill-gray-300 hover:brightness-150 duration-100' 
                    dangerouslySetInnerHTML={{__html:saveIcon }} onClick={() => setViewFaves(true)}></button>
    
            {viewFavs && 
                <>
                    <div className="fixed right-0 top-[5%] h-dvh w-full z-50">
                        {openFav && 
                            <div className='fixed top-0 left-0 bg-[#000000cc] backdrop-blur-sm z-50 w-screen h-dvh p-5'>
                                <a onClick={() => setOpenFav(false)} 
                                className={`bg-white w-8 h-8 rounded-full p-2 leading-none cursor-pointer absolute z-50 text-gray-900 hover:text-black md:top-10 md:right-12 top-[unset] right-[unset] left-1/2 bottom-8 md:left-[unset] md:bottom-[unset]`}>X</a>
                                <img src={modalFav} className='w-auto h-full mx-auto rounded-lg translate-y-8' />
                            </div>
                        }

                        <div className='dark:bg-[#3a3b3c] bg-[#dddddd] px-8 py-3 h-screen overflow-y-auto'>
                            <div className="flex gap-3">
                                <button onClick={() => setViewFaves(false)} className='w-5 h-5 rounded-full p-2 leading-[0] z-50 cursor-pointer'>X</button>
                            </div>
    
                            <div className="flex flex-wrap gap-5 justify-stretch mx-auto py-8 fav">
                                {Object.entries(favorite).map((item, index) => (
            
                                    <>
                                    {item[1] ? 
                                        <figure key={index} className="relative [&:has(:hover)_img]:brightness-75 duration-100 [&:has(svg:hover)_img]:brightness-50 h-full">
    
                                            <div className='flex gap-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [scale:.8] z-10'>
                                                <button dangerouslySetInnerHTML={{__html:deletar}} onClick={()=>favoritar(item[0])}
                                                        className="[&>svg_path]:stroke-gray-600 [&>svg_path]:fill-none hover:[&>svg]:brightness-[5] bg-gray-300/70 backdrop-blur-sm p-1 rounded"></button>
        
                                                <button dangerouslySetInnerHTML={{__html:eyeIcon}} onClick={()=>favoriteModal(item[0])}
                                                        className="[&>svg_path]:stroke-gray-600 [&>svg_path]:fill-none hover:[&>svg]:brightness-[5] bg-gray-300/70 backdrop-blur-sm p-1 rounded"></button>
                                            </div>
                                                <Image
                                                   className="w-[130px] h-auto object-cover object-center rounded-md z-0 duration-150 bg-[#00000011]"
                                                   src={item[0]}
                                                   alt="Favorited Image"
                                                   width={130}
                                                   height={0}
                                                   priority
                                                   sizes="10vw"
                                                />
                                        </figure> : ''}
                                    </>
                                ))
                            }
                            </div>
                        </div>
                    </div>
                </>
            }
            <div className='mansonry' key='mansonry' style={{ zIndex: modal ? 99 : 5 }}>
                {filtro.map((pastinha) => (
                    <span key={pastinha.cat}>
                        {pastinha.img.map(({ url, timeCreated }, index) => (
                            <figure key={index} className={`item ${pastinha.cat.toLowerCase()} [&:has(img:hover)_button]:opacity-100 [&:has(button:hover)_button]:opacity-100 grid place-items-center`} style={{ color: colors[url] }} >
                               
                                {logado &&(
                                    <button className='absolute top-1 left-1 opacity-0 z-50 shadow-sm px-1 py-1 rounded [&>svg_path]:fill-none [&>svg_path]:stroke-gray-500 hover:[&>svg_path]:fill-gray-500 duration-300' 
                                            dangerouslySetInnerHTML={{__html: deletar}} 
                                            title='deletar'
                                            onClick={() => { 
                                                setConfirmation(true), 
                                                setDelURL(url), 
                                                setDelCat(pastinha.cat) 
                                            }}>
                                    </button>
                                )}
                               <Image
                                    className="bg z-40 w-full h-full"
                                    src={url}
                                    alt={`${pastinha.cat} | BRUNO FRANCISCO`}
                                    width={0}
                                    height={0}
                                    priority
                                    sizes="100vw"
                                    onClick={() => abrirModal(url, pastinha.img)}
                                 />
                                <figcaption className='flex flex-col justify-end text-left ' >
                                    <span className='text-base text-gray-200 font-semibold leading-none'>{pastinha.cat}</span>
                                    <time className='text-[.6rem] text-gray-300 leading-none'>enviado: {dataUpload(timeCreated)}</time>
                                </figcaption>
    
                                {favorite[url] && <button dangerouslySetInnerHTML={{__html:saveIcon}}
                                        className='[&>svg_path]:fill-gray-500 hover:brightness-150 duration-100 z-50 absolute top-2 right-2'
                                        onClick={() => favoritar(url)}>
                                </button>}

                                {!favorite[url] && <button dangerouslySetInnerHTML={{__html:savedIcon}}
                                        className='[&>svg_path]:stroke-gray-500 [&>svg_path]:fill-none hover:brightness-150 duration-100 z-50 absolute top-2 right-2'
                                        onClick={() => favoritar(url)}>
                                </button>}
                            </figure>
                        ))}
                        
                    </span>
                ))}
                {confirmation && 
                    <div className='fixed bg-[#00000066] w-full h-[100dvh] top-0 left-0 z-[999999] grid place-items-center'>
                        <div className='flex flex-col justify-center items-center bg-gray-200/30 backdrop-blur-md rounded-xl px-10 py-5 gap-4 max-w-[300px] w-[90%] border-gray-400/60 border-2 shadow-2xl'>
                            <h2 className='font-semibold text-gray-50'>TEM CERTEZA?</h2>
                            <div className='flex justify-center items-center gap-4'>
                                <button onClick={() => { excluirImg(delURL, delCat), setConfirmation(false) }} className='bg-black px-4 py-2 text-white text-sm rounded-lg'> DELETAR</button>
                                <button onClick={() => setConfirmation(false)} className='bg-white px-4 py-2 text-black text-sm rounded-lg'>CANCELAR</button>
                            </div>
                        </div>
                    </div>
                }
                {modal && (
                    <div className="fixed z-[60] w-full h-dvh backdrop-blur-md backdrop-saturate-[.1] backdrop-brightness-[.3] saturate-[1.3] left-0 top-0 grid place-items-center">
                        <a onClick={() =>setModal(false)} 
                            className={`bg-black w-8 h-8 rounded-full p-2 leading-none cursor-pointer absolute z-50 text-gray-300 hover:text-white md:top-10 md:right-12 top-[unset] right-[unset] left-1/2 bottom-8 md:left-[unset] md:bottom-[unset]`}>X</a>
                        
                        <Splide options={{type:'loop', rewind:true, start:currentImageIndex, pagination:false, keyboard:true}}>
                            {currentCategoryImages.map(({ url }, index) => (
                                <SplideSlide key={index}>       
                                 <Image
                                       className='w-auto h-[95dvh] block mx-auto rounded-3xl object-contain'
                                       src={url}
                                       alt={`Image ${index}`}
                                       width={0}
                                       height={0}
                                       priority
                                       sizes="50vw"
                                    />                           
                                </SplideSlide>
                            ))}
                        </Splide>
                    </div>
                )}
            </div>
        </>
    );
};
export default Mansonry;
